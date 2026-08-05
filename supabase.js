// مكتبة الاتصال المصغرة والمباشرة بـ Supabase
(function (global) {
    'use strict';

    const SupabaseClient = function (url, anonKey) {
        this.url = url.replace(/\/$/, '');
        this.anonKey = anonKey;
    };

    SupabaseClient.prototype.from = function (tableName) {
        const self = this;
        return {
            insert: async function (dataArray) {
                try {
                    const endpoint = `${self.url}/rest/v1/${tableName}`;
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'apikey': self.anonKey,
                            'Authorization': `Bearer ${self.anonKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(dataArray)
                    });

                    if (!response.ok) {
                        const errData = await response.json();
                        return { data: null, error: { message: errData.message || 'فشل إدخال البيانات' } };
                    }

                    const resData = await response.json();
                    return { data: resData, error: null };
                } catch (err) {
                    return { data: null, error: { message: err.message } };
                }
            }
        };
    };

    global.supabase = {
        createClient: function (url, anonKey) {
            return new SupabaseClient(url, anonKey);
        }
    };
})(typeof window !== 'undefined' ? window : global);