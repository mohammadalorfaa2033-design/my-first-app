// كود الاتصال السحابي المباشر المطور والمصلح بالكامل
class CustomSupabaseClient {
    constructor(url, anonKey) {
        this.url = url.replace(/\/$/, '');
        this.anonKey = anonKey;
    }

    from(tableName) {
        const self = this;
        // تعديل جوهري: عزل مصفوفة الشروط داخل نطاق الجدول المستدعى لمنع تراكمها
        const context = {
            baseUrl: `${self.url}/rest/v1/${tableName}`,
            conditions: [],
            headers: {
                'apikey': self.anonKey,
                'Authorization': `Bearer ${self.anonKey}`,
                'Content-Type': 'application/json'
            },

            // دالة الفلترة ومطابقة الحقول
            eq: function (column, value) {
                this.conditions.push(`${column}=eq.${encodeURIComponent(value)}`);
                return this;
            },

            // جلب سجل واحد فقط بأمان
            maybeSingle: async function () {
                try {
                    let finalUrl = this.baseUrl;
                    if (this.conditions.length > 0) {
                        finalUrl += `?${this.conditions.join('&')}`;
                    }
                    const singleHeaders = { 
                        ...this.headers, 
                        'Accept': 'application/vnd.pgrst.object+json' 
                    };
                    const response = await fetch(finalUrl, { method: 'GET', headers: singleHeaders });
                    
                    if (response.status === 406 || response.status === 404) {
                        return { data: null, error: null };
                    }
                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        return { data: null, error: { message: errData.message || 'خطأ حساب' } };
                    }
                    const resData = await response.json();
                    return { data: resData, error: null };
                } catch (err) {
                    return { data: null, error: { message: err.message } };
                }
            },

            // جلب مجموعة سجلات من السحاب
            select: async function (columns = '*') {
                try {
                    let params = [`select=${columns}`];
                    if (this.conditions.length > 0) {
                        params.push(...this.conditions);
                    }
                    const finalUrl = `${this.baseUrl}?${params.join('&')}`;
                    const response = await fetch(finalUrl, { method: 'GET', headers: this.headers });
                    
                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        return { data: null, error: { message: errData.message || 'خطأ جلب' } };
                    }
                    const resData = await response.json();
                    return { data: resData, error: null };
                } catch (err) {
                    return { data: null, error: { message: err.message } };
                }
            },

            // إدراج سجلات جديدة في السحاب
            insert: async function (dataArray) {
                try {
                    const response = await fetch(this.baseUrl, {
                        method: 'POST',
                        headers: { ...this.headers, 'Prefer': 'return=representation' },
                        body: JSON.stringify(dataArray)
                    });
                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        return { data: null, error: { message: errData.message || 'خطأ مزامنة' } };
                    }
                    const resData = await response.json();
                    return { data: resData, error: null };
                } catch (err) {
                    return { data: null, error: { message: err.message } };
                }
            },

            // إضافة دالة التحديث (Update) المفقودة لمعالجة حالة المنظومة
            update: async function (updateObject) {
                try {
                    let finalUrl = this.baseUrl;
                    if (this.conditions.length > 0) {
                        finalUrl += `?${this.conditions.join('&')}`;
                    }
                    const response = await fetch(finalUrl, {
                        method: 'PATCH', // استخدام PATCH للتعديل الجزئي السحابي
                        headers: { ...this.headers, 'Prefer': 'return=representation' },
                        body: JSON.stringify(updateObject)
                    });
                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        return { data: null, error: { message: errData.message || 'خطأ في تحديث البيانات' } };
                    }
                    const resData = await response.json();
                    return { data: resData, error: null };
                } catch (err) {
                    return { data: null, error: { message: err.message } };
                }
            }
        };
        return context;
    }
}

// تعريف الكائن العام للمنظومة ليتم قراءته فوراً في ملف app.js
window.supabase = {
    createClient: function (url, anonKey) { 
        return new CustomSupabaseClient(url, anonKey); 
    }
};
