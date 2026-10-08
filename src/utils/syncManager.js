// Edge Synchronization Manager
// Handles bi-directional synchronization, offline queueing, and Cloudflare Pages Functions coordination

class SyncManager {
  constructor() {
    this.storageKey = 'svp_edge_offline_queue';
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.syncState = 'IDLE'; // 'IDLE' | 'SYNCING' | 'SYNCED' | 'OFFLINE_BUFFERED' | 'ERROR'
    this.lastSyncedAt = new Date().toLocaleTimeString();
    this.listeners = new Set();
    this.autoSyncTimer = null;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notify();
        this.flushOfflineQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.syncState = 'OFFLINE_BUFFERED';
        this.notify();
      });

      // Background auto-sync interval every 25 seconds
      this.autoSyncTimer = setInterval(() => {
        if (this.isOnline && this.getQueue().length > 0) {
          this.flushOfflineQueue();
        }
      }, 25000);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const state = {
      isOnline: this.isOnline,
      syncState: this.syncState,
      queueLength: this.getQueue().length,
      lastSyncedAt: this.lastSyncedAt
    };
    this.listeners.forEach(cb => {
      try {
        cb(state);
      } catch (err) {
        console.error('Sync listener error:', err);
      }
    });
  }

  getQueue() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  setQueue(queue) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch (e) {
      console.warn('Could not save queue to localStorage', e);
    }
    this.notify();
  }

  enqueue(item) {
    const queue = this.getQueue();
    queue.push({
      ...item,
      queuedAt: new Date().toISOString()
    });
    this.setQueue(queue);
    this.syncState = 'OFFLINE_BUFFERED';
    this.notify();
  }

  async sendRequest(url, method = 'POST', data = null) {
    if (!this.isOnline) {
      return { success: false, offline: true };
    }

    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }

      const res = await fetch(url, options);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.warn(`Fetch to ${url} failed:`, err.message);
      return { success: false, networkError: true, error: err.message };
    }
  }

  // 1. Transaction Billing Sync
  async pushTransaction(txn) {
    const res = await this.sendRequest('/api/billing', 'POST', txn);
    if (!res || !res.success) {
      this.enqueue({ type: 'TRANSACTION', ...txn });
      return { synced: false, buffered: true, txn };
    }
    this.lastSyncedAt = new Date().toLocaleTimeString();
    this.syncState = 'SYNCED';
    this.notify();
    return { synced: true, res };
  }

  // 2. Shift Handover Sync
  async pushShiftHandover(handover) {
    const res = await this.sendRequest('/api/shifts', 'POST', handover);
    if (!res || !res.success) {
      this.enqueue({ type: 'SHIFT_HANDOVER', ...handover });
      return { synced: false, buffered: true };
    }
    this.lastSyncedAt = new Date().toLocaleTimeString();
    this.syncState = 'SYNCED';
    this.notify();
    return { synced: true, res };
  }

  // 3. Inward Tanker Decantation Sync
  async pushDecantation(decData) {
    const res = await this.sendRequest('/api/tanks', 'POST', decData);
    if (!res || !res.success) {
      this.enqueue({ type: 'DECANTATION', ...decData });
      return { synced: false, buffered: true };
    }
    this.lastSyncedAt = new Date().toLocaleTimeString();
    this.syncState = 'SYNCED';
    this.notify();
    return { synced: true, res };
  }

  // 4. Digital Indent Creation Sync
  async pushDigitalIndent(indentData) {
    const res = await this.sendRequest('/api/indents', 'POST', indentData);
    if (!res || !res.success) {
      this.enqueue({ type: 'INDENT_CREATE', ...indentData });
      return { synced: false, buffered: true };
    }
    this.lastSyncedAt = new Date().toLocaleTimeString();
    this.syncState = 'SYNCED';
    this.notify();
    return { synced: true, res };
  }

  // 5. Digital Indent Redemption Sync
  async pushRedeemIndent(indentId, receiptNo) {
    const res = await this.sendRequest('/api/indents', 'POST', {
      action: 'REDEEM',
      indentId,
      receiptNo
    });
    if (!res || !res.success) {
      this.enqueue({ type: 'INDENT_REDEEM', indentId, receiptNo });
      return { synced: false, buffered: true };
    }
    this.lastSyncedAt = new Date().toLocaleTimeString();
    this.syncState = 'SYNCED';
    this.notify();
    return { synced: true, res };
  }

  // 6. Daybook Expense Voucher Sync
  async pushExpense(expenseData) {
    const res = await this.sendRequest('/api/daybook', 'POST', {
      action: 'RECORD_EXPENSE',
      ...expenseData
    });
    if (!res || !res.success) {
      this.enqueue({ type: 'EXPENSE', ...expenseData });
      return { synced: false, buffered: true };
    }
    this.lastSyncedAt = new Date().toLocaleTimeString();
    this.syncState = 'SYNCED';
    this.notify();
    return { synced: true, res };
  }

  // 7. Bank Deposit Remittance Sync
  async pushBankDeposit(depositData) {
    const res = await this.sendRequest('/api/daybook', 'POST', {
      action: 'RECORD_BANK_DEPOSIT',
      ...depositData
    });
    if (!res || !res.success) {
      this.enqueue({ type: 'BANK_DEPOSIT', ...depositData });
      return { synced: false, buffered: true };
    }
    this.lastSyncedAt = new Date().toLocaleTimeString();
    this.syncState = 'SYNCED';
    this.notify();
    return { synced: true, res };
  }

  // 8. 5-Liter Calibration Stamping Sync
  async pushCalibration(calData) {
    const res = await this.sendRequest('/api/nozzles', 'POST', {
      action: 'RECORD_CALIBRATION',
      ...calData
    });
    if (!res || !res.success) {
      this.enqueue({ type: 'CALIBRATION', ...calData });
      return { synced: false, buffered: true };
    }
    this.lastSyncedAt = new Date().toLocaleTimeString();
    this.syncState = 'SYNCED';
    this.notify();
    return { synced: true, res };
  }

  // 9. Nozzle Interlock / Safety Status Sync
  async pushNozzleStatus(target) {
    const res = await this.sendRequest('/api/nozzles', 'POST', {
      action: 'SET_STATUS',
      ...target
    });
    return res;
  }

  // 10. Morning Density Register Sync
  async pushMorningDensity(densityData) {
    const res = await this.sendRequest('/api/compliance', 'POST', {
      action: 'LOG_MORNING_DENSITY',
      ...densityData
    });
    if (!res || !res.success) {
      this.enqueue({ type: 'MORNING_DENSITY', ...densityData });
      return { synced: false, buffered: true };
    }
    this.lastSyncedAt = new Date().toLocaleTimeString();
    this.syncState = 'SYNCED';
    this.notify();
    return { synced: true, res };
  }

  // 11. Coordination State Fetch
  async fetchCoordination() {
    return await this.sendRequest('/api/coordination', 'GET');
  }

  // 12. Flush Offline Queue in Batch
  async flushOfflineQueue() {
    const queue = this.getQueue();
    if (queue.length === 0) {
      this.syncState = 'SYNCED';
      this.notify();
      return { success: true, count: 0 };
    }

    this.syncState = 'SYNCING';
    this.notify();

    try {
      const res = await this.sendRequest('/api/sync', 'POST', {
        queue,
        clientTimestamp: new Date().toISOString()
      });

      if (res && res.success) {
        this.setQueue([]);
        this.syncState = 'SYNCED';
        this.lastSyncedAt = new Date().toLocaleTimeString();
        this.notify();
        return { success: true, count: queue.length, res };
      } else {
        this.syncState = 'OFFLINE_BUFFERED';
        this.notify();
        return { success: false };
      }
    } catch {
      this.syncState = 'OFFLINE_BUFFERED';
      this.notify();
      return { success: false };
    }
  }
}

export const syncManager = new SyncManager();
