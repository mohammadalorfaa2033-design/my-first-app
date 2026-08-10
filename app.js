// [إصلاح حاسم]: حقن برمي مبكر لمكتبة SheetJS لضمان استقرار الفرز لملفات الإكسل والتقارير
if (typeof XLSX === 'undefined') {
    var script = document.createElement('script');
    script.src = "https://cloudflare.com";
    document.head.appendChild(script);
}

// 🌐 إعدادات الاتصال السحابي المباشر بـ Supabase 
// (قم بنسخ ولصق معطيات مشروعك الفعلي من لوحة تحكم Supabase -> Settings -> API)
const SUPABASE_URL = "https://nkcngzsjevgzurwxkjqn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rY25nenNqZXZnenVyd3hranFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NTQyMTEsImV4cCI6MjEwMTMzMDIxMX0.2UlqfEPT-TCBGnIfHqn1sArX1AOkhRr6zvnQt4evD0U";

var staffDb = [];
var groupCounter = 0; 

// ⌨️ رصد ضغط مفتاح Enter للعبور المباشر والصامت دون أي تأكيدات منبثقة أو عوائق
function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        authenticateUserGateway(); 
    }
}

// 👁️ تبديل حالة حقل إدخال الأرقام السرية لبيان الرموز المكتوبة (إظهار/إخفاء)
function togglePasswordVisibility() {
    var passwordInput = document.getElementById('accessPasscode');
    var eyeIcon = document.getElementById('eyeIcon');
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.innerText = "❌";
    } else {
        passwordInput.type = "password";
        eyeIcon.innerText = "👁️";
    }
}

// 🔓 بوابة فحص رمز الصلاحية والولوج الآلي المباشر للواجهة التشغيلية دون رسائل تأكيد
function authenticateUserGateway() {
    var inputCode = document.getElementById('accessPasscode').value.trim();
    var authGate = document.getElementById('gatekeeperSystem');
    var mainPlatform = document.getElementById('mainHajjPlatform');

    if (!inputCode) { 
        alert("⚠️ فضلاً، أدخل رمز الصلاحية أولاً!"); 
        return; 
    }

    if (inputCode === "main123456" || inputCode === "admn123") {
        authGate.style.display = 'none';
        mainPlatform.style.display = 'block';
        initializePlatformUI();
    } else {
        alert("❌ رمز الصلاحية المكتوب غير مسجل بنظام المديرية!");
    }
}

function initializePlatformUI() {
    // [حل أمني حاسم]: فحص وجود المكتبة قبل الاستدعاء، وإن لم تكن جاهزة انتظرها 300 مللي ثانية وأعد المحاولة تلقائياً لتفادي الخطأ
    if (typeof XLSX === 'undefined') {
        document.getElementById('adminStatusLogs').innerText = '⏳ جاري تهيئة محرك التفريد السحابي...';
        setTimeout(initializePlatformUI, 300);
        return;
    }
    fetchStaffFromSupabase();
}

// ⏳ محرك الجلب الآمن فائق السرعة والمشفر من جداول Supabase مباشرة وتجاوز مشاكل CORS لقوقل
function fetchStaffFromSupabase() {
    if (!SUPABASE_URL || SUPABASE_URL.includes("your-project-id")) {
        loadBackupLocalDatabase("⚠️ المنصة تعمل محلياً بالقاعدة الافتراضية بانتظار تفعيل مفاتيح سوبابيس.");
        return;
    }

    document.getElementById('adminStatusLogs').innerText = '⏳ جاري الاتصال بقاعدة بيانات Supabase ومزامنة الكوادر...';

    fetch(`${SUPABASE_URL}/rest/v1/staff?select=*`, {
        method: "GET",
        headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('فشل الاستجابة من خادم سوبابيس');
        return response.json();
    })
    .then(data => {
        staffDb = data;
        document.getElementById('adminStatusLogs').innerText = `✅ تم المزامنة مع Supabase! جلب عدد (${staffDb.length}) اسم كادر حياً.`;
        document.getElementById('adminStatusLogs').style.color = "var(--success)";
        
        populateClusterLeaderDropdown();
        renderClusterStaffTable();
        addNewDynamicGroupSection();
    })
    .catch(error => {
        console.error("Supabase connection error:", error);
        loadBackupLocalDatabase("⚠️ فشل اتصال سوبابيس الحقيقي. تم تشغيل قاعدة البيانات الميدانية الاحتياطية بأمان.");
    });
}

// 🛡️ خزان الأمان للحفاظ على عمل المنصة الميداني وضمان تعبئة الجداول حتى لو انقطع الإنترنت
function loadBackupLocalDatabase(statusMsg) {
    document.getElementById('adminStatusLogs').innerText = statusMsg;
    document.getElementById('adminStatusLogs').style.color = "orange";
    
    staffDb = [
        { "الاسم": "أحمد الأحمد", "الصفة": "رئيس تكتل", "الهاتف": "963911111111", "المكتب": "مكتب dمشق المركزي" },
        { "الاسم": "محمود المصطفى", "الصفة": "رئيس تكتل", "الهاتف": "963922222222", "المكتب": "مكتب ريف دمشق الأول" },
        { "الاسم": "ياسر المحمد", "الصفة": "رئيس مجموعة", "الهاتف": "963933333333", "المكتب": "مكتب حلب الإداري", "الفئة": "الفئة الأولى (1)" },
        { "الاسم": "خالد العلي", "الصفة": "رئيس مجموعة", "الهاتف": "963944444444", "المكتب": "مكتب حمص الفرعي", "الفئة": "الفئة الثالثة (3)" },
        { "الاسم": "محمد الشيخ", "الصفة": "منسق", "الهاتف": "963955555555" },
        { "الاسم": "عبد الرحمن الحسين", "الصفة": "منسق", "الهاتف": "963966666666" },
        { "الاسم": "فاطمة الزهراء", "الصفة": "موجهة دينية", "الهاتف": "963977777777" },
        { "الاسم": "هند العبدالله", "الصفة": "موجهة دينية", "الهاتف": "963988888888" },
        { "الاسم": "عمر الفاروق", "الصفة": "معاون", "الهاتف": "963999999999" },
        { "الاسم": "باسل الحسن", "الصفة": "موجه ديني", "الهاتف": "963900000000" }
    ];
    
    populateClusterLeaderDropdown();
    renderClusterStaffTable();
    addNewDynamicGroupSection(); 
}

function populateClusterLeaderDropdown() {
    var leaderSelect = document.getElementById('c_leader_select');
    if(!leaderSelect) return;
    leaderSelect.innerHTML = '<option value="">-- ابحث واختر رئيس التكتل --</option>';
    staffDb.forEach(function(person) {
        if(person.الصفة === "رئيس تكتل") {
            leaderSelect.innerHTML += '<option value="' + person.الاسم + '">' + person.الاسم + '</option>';
        }
    });
}

function syncClusterLeaderData() {
    var selectedLeader = document.getElementById('c_leader_select').value;
    var phoneInput = document.getElementById('c_leader_phone');
    var officeInput = document.getElementById('c_registration_office');
    
    var match = staffDb.find(s => s.الاسم === selectedLeader && s.الصفة === "رئيس تكتل");
    if(match) {
        phoneInput.value = match.الهاتف || 'غير مدرج';
        officeInput.value = match.المكتب || 'المكتب الرئيسي للمديرية'; 
    } else {
        phoneInput.value = ''; officeInput.value = '';
    }
    renderClusterStaffTable();
}
// 🔄 تصفير الحجز العيني لضمان الفرز الفريد وتفادي تكرار الاسم في كشوف الجداول
function resetStaffClaims() {
    staffDb.forEach(function(s) { s.isTaken = false; });
}

// 📊 بناء وتوليد جدول كادر التكتل الرئيسي يدوياً تبعاً لتغيير خانات الأرقام المحددة (معاون، منسق، إلخ)
function renderClusterStaffTable() {
    var tbody = document.getElementById('clusterTableBody');
    if(!tbody) return; tbody.innerHTML = '';
    resetStaffClaims();

    var coords = parseInt(document.getElementById('c_coord_num').value) || 0;
    var guides = parseInt(document.getElementById('c_guides_num').value) || 0;
    var assistants = parseInt(document.getElementById('c_assistants_num').value) || 0;
    var clergy = parseInt(document.getElementById('c_clergy_num').value) || 0;

    var clusterRoles = [];
    for(var i=1; i<=coords; i++) clusterRoles.push("منسق");
    for(var j=1; j<=guides; j++) clusterRoles.push("موجهة دينية");
    for(var k=1; k<=assistants; k++) clusterRoles.push("معاون");
    for(var l=1; l<=clergy; l++) clusterRoles.push("موجه ديني");

    var index = 1;
    clusterRoles.forEach(function(role) {
        appendRowToTable(tbody, index++, role);
    });
}

// ➕ محرك التوليد الهيكلي لإضافة مجموعات فرعية لا نهائية باستمارات وجداول داخلية مستقلة تتبع التكتل
function addNewDynamicGroupSection() {
    groupCounter++;
    var wrapper = document.getElementById('dynamicGroupsWrapper');
    if(!wrapper) return;
    
    var groupHtml = `
        <div class="dynamic-group-box" id="groupWrapper_${groupCounter}" style="margin-top: 30px; border-top: 2px dashed var(--primary); padding-top: 15px;">
            <div class="section-title" style="background-color: #243e6b;">📦 التحديد الثالث: المجموعة المنضوية رقم (${groupCounter})</div>
            <div class="form-grid">
                <div class="form-grid-cell"><label>اسم المجموعة الداخلي</label><input type="text" id="g_name_${groupCounter}" value="مجموعة فرعية رقم ${groupCounter}"></div>
                <div class="form-grid-cell">
                    <label>رئيس المجموعة (الاسم)</label>
                    <select id="g_leader_select_${groupCounter}" onchange="syncDynamicGroupLeaderData(${groupCounter})">
                        <option value="">-- ابحث واختر رئيس المجموعة --</option>
                    </select>
                </div>
                <div class="form-grid-cell"><label>رقم هاتف رئيس المجموعة</label><input type="text" id="g_leader_phone_${groupCounter}" readonly placeholder="يُجلب تلقائياً"></div>
                <div class="form-grid-cell"><label>مكتب التسجيل (رئيس المجموعة)</label><input type="text" id="g_office_${groupCounter}" readonly placeholder="يُجلب تلقائياً"></div>
                <div class="form-grid-cell"><label>الفئة المعتمدة للمجموعة</label><input type="text" id="g_category_${groupCounter}" readonly placeholder="تُجلب تلقائياً"></div>
                
                <div class="form-grid-cell"><label>عدد المعاونين المطلوبين للمجموعة</label><input type="number" id="g_assistants_${groupCounter}" value="1" min="0" oninput="renderDynamicGroupTable(${groupCounter})"></div>
                <div class="form-grid-cell"><label>عدد الموجهين المطلوبين للمجموعة</label><input type="number" id="g_clergy_${groupCounter}" value="1" min="0" oninput="renderDynamicGroupTable(${groupCounter})"></div>
                <div class="form-grid-cell bg-empty"></div>
            </div>

            <div class="section-title" style="background-color: #555; font-size:12px;">📋 كادر المجموعة الداخلي رقم (${groupCounter})</div>
            <table>
                <thead>
                    <tr><th style="width:15%;">الرقم</th><th style="width:35%;">الصفة المعتمدة ضمن المجموعة</th><th style="width:50%;">الاسم والمراسلة الفورية الفعّالة</th></tr>
                </thead>
                <tbody id="groupTableBody_${groupCounter}">
                    <tr><td colspan="3" class="table-placeholder">يرجى اختيار رئيس المجموعة لتوليد بيانات الكادر الداخلي...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    wrapper.insertAdjacentHTML('beforeend', groupHtml);
    populateGroupLeaderDropdown(groupCounter);
    updateTotalGroupsAndCategoriesCount();
}

// تعبئة قوائم الاختيار لرؤساء المجموعات ديناميكياً لكل قسم جديد يضاف للمنصة
function populateGroupLeaderDropdown(id) {
    var selectElement = document.getElementById(\`g_leader_select_\${id}\`);
    if(!selectElement) return;
    selectElement.innerHTML = '<option value="">-- ابحث واختر رئيس المجموعة --</option>';
    staffDb.forEach(function(person) {
        if(person.Campany === "رئيس مجموعة" || person.الصفة === "رئيس مجموعة") {
            selectElement.innerHTML += '<option value="' + person.الاسم + '">' + person.الاسم + '</option>';
        }
    });
}
// 📋 جلب هاتف ومكتب وفئة رئيس المجموعة بمجرد اختياره أوتوماتيكياً من قاعدة البيانات السحابية
function syncDynamicGroupLeaderData(id) {
    var selectedLeader = document.getElementById(`g_leader_select_${id}`).value;
    var phoneInput = document.getElementById(`g_leader_phone_${id}`);
    var officeInput = document.getElementById('g_office_' + id);
    var categoryInput = document.getElementById('g_category_' + id);

    var match = staffDb.find(function(s) { return s.الاسم === selectedLeader && s.الصفة === "رئيس مجموعة"; });
    if(match) {
        phoneInput.value = match.الهاتف || 'غير مدرج';
        officeInput.value = match.المكتب || 'مكتب المحافظة المعتمد';
        categoryInput.value = match.الفئة || 'غير محدد';
    } else {
        phoneInput.value = ''; officeInput.value = ''; categoryInput.value = '';
    }
    updateTotalGroupsAndCategoriesCount();
    renderDynamicGroupTable(id);
}

// ضبط الأعداد الإحصائية في التحديد الأول بشكل ديناميكي تزامناً مع الفئات الحية للمجموعات المنشأة
function updateTotalGroupsAndCategoriesCount() {
    var groupsCountInput = document.getElementById('c_groups_num');
    if(groupsCountInput) groupsCountInput.value = groupCounter;
    
    var uniqueCategories = new Set();
    for(var i = 1; i <= groupCounter; i++) {
        var catVal = document.getElementById(`g_category_${i}`) ? document.getElementById(`g_category_${i}`).value : '';
        if(catVal && catVal !== 'غير محدد') uniqueCategories.add(catVal);
    }
    var catCountInput = document.getElementById('c_categories_num');
    if(catCountInput) catCountInput.value = uniqueCategories.size > 0 ? uniqueCategories.size : '1';
}

// بناء وتوليد كادر المجموعة ديناميكياً وبشكل يدوي مرن مطابق تماماً لآلية التكتل القيادي
function renderDynamicGroupTable(id) {
    var tbody = document.getElementById(`groupTableBody_${id}`);
    if(!tbody) return; tbody.innerHTML = '';
    
    var selectedLeader = document.getElementById(`g_leader_select_${id}`).value;
    if(!selectedLeader) {
        tbody.innerHTML = '<tr><td colspan="3" class="table-placeholder">يرجى اختيار رئيس المجموعة لتوليد بيانات الكادر الداخلي...</td></tr>';
        return;
    }
// 🔄 تصفير الحجز العيني لضمان الفرز الفريد وتفادي تكرار الاسم في كشوف الجداول
function resetStaffClaims() {
    staffDb.forEach(function(s) { s.isTaken = false; });
}

// 📊 بناء وتوليد جدول كادر التكتل الرئيسي يدوياً تبعاً لتغيير خانات الأرقام المحددة (معاون، منسق، إلخ)
function renderClusterStaffTable() {
    var tbody = document.getElementById('clusterTableBody');
    if(!tbody) return; tbody.innerHTML = '';
    resetStaffClaims();

    var coords = parseInt(document.getElementById('c_coord_num').value) || 0;
    var guides = parseInt(document.getElementById('c_guides_num').value) || 0;
    var assistants = parseInt(document.getElementById('c_assistants_num').value) || 0;
    var clergy = parseInt(document.getElementById('c_clergy_num').value) || 0;

    var clusterRoles = [];
    for(var i=1; i<=coords; i++) clusterRoles.push("منسق");
    for(var j=1; j<=guides; j++) clusterRoles.push("موجهة دينية");
    for(var k=1; k<=assistants; k++) clusterRoles.push("معاون");
    for(var l=1; l<=clergy; l++) clusterRoles.push("موجه ديني");

    var index = 1;
    clusterRoles.forEach(function(role) {
        appendRowToTable(tbody, index++, role);
    });
}

// ➕ محرك التوليد الهيكلي لإضافة مجموعات فرعية لا نهائية باستمارات وجداول داخلية مستقلة تتبع التكتل
function addNewDynamicGroupSection() {
    groupCounter++;
    var wrapper = document.getElementById('dynamicGroupsWrapper');
    if(!wrapper) return;
    
    var groupHtml = `
        <div class="dynamic-group-box" id="groupWrapper_` + groupCounter + `" style="margin-top: 30px; border-top: 2px dashed var(--primary); padding-top: 15px;">
            <div class="section-title" style="background-color: #243e6b;">📦 التحديد الثالث: المجموعة المنضوية رقم (` + groupCounter + `)</div>
            <div class="form-grid">
                <div class="form-grid-cell"><label>اسم المجموعة الداخلي</label><input type="text" id="g_name_` + groupCounter + `" value="مجموعة فرعية رقم ` + groupCounter + `"></div>
                <div class="form-grid-cell">
                    <label>رئيس المجموعة (الاسم)</label>
                    <select id="g_leader_select_` + groupCounter + `" onchange="syncDynamicGroupLeaderData(` + groupCounter + `)">
                        <option value="">-- ابحث واختر رئيس المجموعة --</option>
                    </select>
                </div>
                <div class="form-grid-cell"><label>رقم هاتف رئيس المجموعة</label><input type="text" id="g_leader_phone_` + groupCounter + `" readonly placeholder="يُجلب تلقائياً"></div>
                <div class="form-grid-cell"><label>مكتب التسجيل (رئيس المجموعة)</label><input type="text" id="g_office_` + groupCounter + `" readonly placeholder="يُجلب تلقائياً"></div>
                <div class="form-grid-cell"><label>الفئة المعتمدة للمجموعة</label><input type="text" id="g_category_` + groupCounter + `" readonly placeholder="تُجلب تلقائياً"></div>
                
                <div class="form-grid-cell"><label>عدد المعاونين المطلوبين للمجموعة</label><input type="number" id="g_assistants_` + groupCounter + `" value="1" min="0" oninput="renderDynamicGroupTable(` + groupCounter + `)"></div>
                <div class="form-grid-cell"><label>عدد الموجهين المطلوبين للمجموعة</label><input type="number" id="g_clergy_` + groupCounter + `" value="1" min="0" oninput="renderDynamicGroupTable(` + groupCounter + `)"></div>
                <div class="form-grid-cell bg-empty"></div>
            </div>

            <div class="section-title" style="background-color: #555; font-size:12px;">📋 كادر المجموعة الداخلي رقم (` + groupCounter + `)</div>
            <table>
                <thead>
                    <tr><th style="width:15%;">الرقم</th><th style="width:35%;">الصفة المعتمدة ضمن المجموعة</th><th style="width:50%;">الاسم والمراسلة الفورية الفعّالة</th></tr>
                </thead>
                <tbody id="groupTableBody_` + groupCounter + `">
                    <tr><td colspan="3" class="table-placeholder">يرجى اختيار رئيس المجموعة لتوليد بيانات الكادر الداخلي...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    wrapper.insertAdjacentHTML('beforeend', groupHtml);
    populateGroupLeaderDropdown(groupCounter);
    updateTotalGroupsAndCategoriesCount();
}

// [تم الإصلاح الجذري]: تنظيف الرموز المكسورة وبناء استدعاء السلاسل النصية بشكل كلاسيكي آمن 100%
function populateGroupLeaderDropdown(id) {
    var selectElement = document.getElementById("g_leader_select_" + id);
    if(!selectElement) return;
    selectElement.innerHTML = '<option value="">-- ابحث واختر رئيس المجموعة --</option>';
    staffDb.forEach(function(person) {
        if(person.Campany === "رئيس مجموعة" || person.الصفة === "رئيس مجموعة") {
            selectElement.innerHTML += '<option value="' + person.الاسم + '">' + person.الاسم + '</option>';
        }
    });
}
// 📋 جلب هاتف ومكتب وفئة رئيس المجموعة بمجرد اختياره أوتوماتيكياً من قاعدة البيانات السحابية
function syncDynamicGroupLeaderData(id) {
    var selectedLeader = document.getElementById("g_leader_select_" + id).value;
    var phoneInput = document.getElementById("g_leader_phone_" + id);
    var officeInput = document.getElementById("g_office_" + id);
    var categoryInput = document.getElementById("g_category_" + id);

    var match = staffDb.find(function(s) { return s.الاسم === selectedLeader && s.الصفة === "رئيس مجموعة"; });
    if(match) {
        phoneInput.value = match.الهاتف || 'غير مدرج';
        officeInput.value = match.المكتب || 'مكتب المحافظة المعتمد';
        categoryInput.value = match.الفئة || 'غير محدد';
    } else {
        phoneInput.value = ''; officeInput.value = ''; categoryInput.value = '';
    }
    updateTotalGroupsAndCategoriesCount();
    renderDynamicGroupTable(id);
}

// ضبط الأعداد الإحصائية في التحديد الأول بشكل ديناميكي تزامناً مع الفئات الحية للمجموعات المنشأة
function updateTotalGroupsAndCategoriesCount() {
    var groupsCountInput = document.getElementById('c_groups_num');
    if(groupsCountInput) groupsCountInput.value = groupCounter;
    
    var uniqueCategories = new Set();
    for(var i = 1; i <= groupCounter; i++) {
        var catVal = document.getElementById("g_category_" + i) ? document.getElementById("g_category_" + i).value : '';
        if(catVal && catVal !== 'غير محدد') uniqueCategories.add(catVal);
    }
    var catCountInput = document.getElementById('c_categories_num');
    if(catCountInput) catCountInput.value = uniqueCategories.size > 0 ? uniqueCategories.size : '1';
}

// بناء وتوليد كادر المجموعة ديناميكياً وبشكل يدوي مرن مطابق تماماً لآلية التكتل القيادي
function renderDynamicGroupTable(id) {
    var tbody = document.getElementById("groupTableBody_" + id);
    if(!tbody) return; tbody.innerHTML = '';
    
    var selectedLeader = document.getElementById("g_leader_select_" + id).value;
    if(!selectedLeader) {
        tbody.innerHTML = '<tr><td colspan="3" class="table-placeholder">يرجى اختيار رئيس المجموعة لتوليد بيانات الكادر الداخلي...</td></tr>';
        return;
    }

    resetStaffClaims();

    var assistants = parseInt(document.getElementById("g_assistants_" + id).value) || 0;
    var clergy = parseInt(document.getElementById("g_clergy_" + id).value) || 0;

    var groupRoles = [];
    for(var i=1; i<=assistants; i++) groupRoles.push("معاون");
    for(var j=1; j<=clergy; j++) groupRoles.push("موجه ديني");

    var index = 1;
    groupRoles.forEach(function(role) {
        appendRowToTable(tbody, index++, role);
    });
}

// خوارزمية البحث والفرز المرن وحجز الأسماء مع تهيئة وتوليد روابط مراسلات الواتساب الفورية الدولية
function appendRowToTable(tbody, rowIndex, role) {
    var tr = document.createElement('tr');
    var assignedName = "لم يُعين الاسم";
    var waHTML = '<span style="color:#999; font-size:12px;">🚫 رقم الهاتف غير مدرج</span>';

    var match = staffDb.find(function(s) { 
        return (s.الصفة === role || s.الصفة === "منسق ومعاون" || s.الصفة === "معاون بعدد" || s.edited_role === role) && !s.isTaken; 
    });

    if(match) {
        assignedName = match.الاسم; 
        match.isTaken = true;
        var phone = String(match.الهاتف).replace(/\s+/g, '').replace('+', '');
        var encodedMsg = encodeURIComponent("السلام عليكم أخي الإداري المعتمد / " + assignedName + "، بصفتك (" + role + ") نرجو المتابعة الميدانية المعتمدة.");
        waHTML = '<a href="https://wa.me' + phone + '?text=' + encodedMsg + '" target="_blank" class="whatsapp-link">💬 مراسلة واتساب (' + assignedName + ')</a>';
    }

    tr.innerHTML = '<td>' + rowIndex + '</td><td><b>' + role + '</b></td><td>' + waHTML + '</td>';
    tbody.appendChild(tr);
}

// 📄 المحرك البرمجي المطور لصياغة وإصدار قرارات التشكيل الرسمية بصيغة PDF تلقائياً
function generateOfficialPdfDecision() {
    var element = document.getElementById('mainHajjPlatform');
    var clusterName = document.getElementById('c_name').value || 'التكتل_الرئيسي';
    
    var opt = {
        margin:       0.4,
        filename:     'قرار_تشكيل_' + clusterName.replace(/\s+/g, '_') + '.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, 
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' } 
    };
    
    html2pdf().set(opt).from(element).save();
}

// تصدير كشوف التشكيل الكاملة إلى وثيقة إكسل مبوبة رسمية
function exportFullClusterReport() {
    var clusterName = document.getElementById('c_name').value || "التكتل الرئيسي";
    var leaderName = document.getElementById('c_leader_select').value || "لم يُعين";
    
    var summaryData = [
        ["تقرير اعتماد التشكيل والتكتلات الميدانية السحابي - مديرية الحج والعمرة"],
        [""],
        ["اسم التكتل الرئيسي:", clusterName, "رئيس التكتل المعتمد:", leaderName],
        ["مكتب تسجيل التكتل:", document.getElementById('c_registration_office').value || "غير محدد", "رقم هاتف الرئيس:", document.getElementById('c_leader_phone').value || "غير محدد"],
        ["إجمالي المجموعات المنضوية الحية:", document.getElementById('c_groups_num').value, "عدد فئات التكتل الإجمالية:", document.getElementById('c_categories_num').value],
        [""]
    ];

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws, "تقرير التشكيل المعتمد");
    
    var fileName = "قرار_اعتماد_" + clusterName.replace(/\s+/g, '_') + ".xlsx";
    XLSX.writeFile(wb, fileName);
}

