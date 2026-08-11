(function (global) {
    'use strict';

    const SupabaseClient = function (url, anonKey) {
        this.url = url.replace(/\/$/, '');
        this.anonKey = anonKey;
    };

    SupabaseClient.prototype.from = function (tableName) {
        const self = this;
        
        const queryBuilder = {
            baseUrl: `${self.url}/rest/v1/${tableName}`,
            queryParams: new URLSearchParams(),
            headers: {
                'apikey': self.anonKey,
                'Authorization': `Bearer ${self.anonKey}`,
                'Content-Type': 'application/json'
            },

            eq: function (column, value) {
                this.queryParams.append(column, `eq.${value}`);
                return this;
            },

            select: async function (columns = '*') {
                try {
                    this.queryParams.append('select', columns);
                    const finalUrl = `${this.baseUrl}?${this.queryParams.toString()}`;
                    
                    const response = await fetch(finalUrl, { method: 'GET', headers: this.headers });
                    if (!response.ok) {
                        const errData = await response.json();
                        return { data: null, error: { message: errData.message || 'فشل جلب البيانات' } };
                    }
                    const resData = await response.json();
                    return { data: resData, error: null };
                } catch (err) {
                    return { data: null, error: { message: err.message } };
                }
            },

            insert: async function (dataArray) {
                try {
                    const response = await fetch(this.baseUrl, {
                        method: 'POST',
                        headers: { ...this.headers, 'Prefer': 'return=representation' },
                        body: JSON.stringify(dataArray)
                    });
                    if (!response.ok) {
                        const errData = await response.json();
                        return { data: null, error: { message: errData.message || 'فشل المزامنة السحابية' } };
                    }
                    const resData = await response.json();
                    return { data: resData, error: null };
                } catch (err) {
                    return { data: null, error: { message: err.message } };
                }
            }
        };
        return queryBuilder;
    };

    global.supabase = {
        createClient: function (url, anonKey) { return new SupabaseClient(url, anonKey); }
    };
})(typeof window !== 'undefined' ? window : global);
