// 🌐 الرابط السحابي المباشر الخاص بملف غوغل شيت لفلترة الأسماء سحابياً حياً
const googleSheetCsvUrl = "⚠️ ضع_هنا_رابط_الـ_CSV_الذي_نسخته_من_خطوة_النشر ⚠️";

var staffDb = [];
var customRules = { 
    "1": ["موجه ديني"], 
    "2": ["موجه ديني", "معاون"], 
    "3": ["موجه ديني", "موجه ديني", "معاون"], 
    "4": ["معاون", "معاون", "معاون", "موجه ديني", "موجه ديني"] 
};

// ⌨️ رصد ضغط زر Enter على لوحة المفاتيح للدخول المباشر
function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        authenticateUserGateway(); // تشغيل بوابة التحقق فوراً
    }
}

// 👁️ إظهار وإخفاء رمز الصلاحية (النجوم) داخل الحقل
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

// 🔓 دالة التحقق الرقمي والدخول الصامت بدون رسائل تأكيد
function authenticateUserGateway() {
    var inputCode = document.getElementById('accessPasscode').value.trim();
    var authGate = document.getElementById('gatekeeperSystem');
    var mainPlatform = document.getElementById('mainHajjPlatform');
    var superAdminSection = document.getElementById('superAdminSection');

    if (!inputCode) { 
        alert("⚠️ فضلاً، أدخل رمز الصلاحية أولاً!"); 
        return; 
    }

    if (inputCode === "main123456" || inputCode === "admn123") {
        authGate.style.display = 'none';
        mainPlatform.style.display = 'block';
        superAdminSection.style.display = (inputCode === "admn123") ? 'block' : 'none'; 
        initializePlatformUI();
    } else {
        alert("❌ رمز الصلاحية المكتوب غير مسجل بنظام المديرية!");
    }
}

// ⚙️ تهيئة الواجهة وعرض تاريخ اليوم الحي عند الدخول
function initializePlatformUI() {
    document.getElementById('liveDate').innerText = new Date().toISOString().split('T')[0];
    fetchStaffFromGoogleSheets();
}

// ↩️ دالة زر العودة لإعادة قفل النظام والتصفير الآمن لحالة الدخول
function logoutGateway() {
    document.getElementById('accessPasscode').value = '';
    document.getElementById('mainHajjPlatform').style.display = 'none';
    document.getElementById('gatekeeperSystem').style.display = 'block';
}

// ⏳ دالة الاتصال بالسحابة وتفكيك ملف الغوغل شيت عبر مكتبة SheetJS
function fetchStaffFromGoogleSheets() {
    if(googleSheetCsvUrl.includes("⚠️")) {
        renderClusterStaffTable();
        return;
    }
    document.getElementById('adminStatusLogs').innerText = '⏳ جاري مزامنة بيانات الكوادر والهواتف من السحابة حياً...';
    
    fetch(googleSheetCsvUrl)
        .then(response => response.text())
        .then(csvText => {
            var workbook = XLSX.read(csvText, {type: 'string'});
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            staffDb = XLSX.utils.sheet_to_json(worksheet);
            document.getElementById('adminStatusLogs').innerText = '✅ تم التحديث السحابي! جلب عدد (' + staffDb.length + ') اسم كادر معتمد حياً.';
            populateDropdownMenus();
            renderClusterStaffTable();
            renderGroupStaffTable();
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById('adminStatusLogs').innerText = '❌ فشل الاتصال بالسحابة.';
            renderClusterStaffTable();
        });
}

// 🗂️ تعبئة القوائم المنسدلة للرؤساء المفرزة تلقائياً من السحابة
function populateDropdownMenus() {
    var leaderSelect = document.getElementById('c_leader_select');
    var groupLeaderSelect = document.getElementById('g_leader_select');

    leaderSelect.innerHTML = '<option value="">-- اختر رئيس التكتل --</option>';
    groupLeaderSelect.innerHTML = '<option value="">-- اختر رئيس المجموعة --</option>';

    staffDb.forEach(function(person) {
        if(person.الصفة === "رئيس تكتل") {
            leaderSelect.innerHTML += '<option value="' + person.الاسم + '">' + person.الاسم + '</option>';
        }
        if(person.الصفة === "رئيس مجموعة") {
            groupLeaderSelect.innerHTML += '<option value="' + person.الاسم + '">' + person.الاسم + '</option>';
        }
    });
}
// 📞 مزامنة وعرض رقم هاتف رئيس التكتل عند اختياره
function syncClusterLeaderName() {
    var selectedLeader = document.getElementById('c_leader_select').value;
    var phoneInput = document.getElementById('c_leader_phone');
    var match = staffDb.find(s => s.الاسم === selectedLeader && s.الصفة === "رئيس تكتل");
    phoneInput.value = match ? match.الهاتف : '';
    renderClusterStaffTable();
}

// 📞 مزامنة وعرض رقم هاتف رئيس المجموعة عند اختياره
function syncGroupLeaderPhone() {
    var selectedLeader = document.getElementById('g_leader_select').value;
    var phoneInput = document.getElementById('g_leader_phone');
    var match = staffDb.find(s => s.الاسم === selectedLeader && s.الصفة === "رئيس مجموعة");
    phoneInput.value = match ? match.الهاتف : '';
}

// 🔄 تصفير حجز الأسماء للسماح بإعادة فرز الجداول بشكل نظيف
function resetStaffClaims() {
    staffDb.forEach(s => s.isTaken = false);
}

// مصفوفات تخزين الأسماء الحالية لتسهيل عملية التصدير الذكي لاحقاً
var activeClusterAssignments = [];
var activeGroupAssignments = [];

// 📊 توليد وبناء جدول كادر التكتل الرئيسي بناءً على الأعداد المطلوبة
function renderClusterStaffTable() {
    var tbody = document.getElementById('clusterTableBody');
    if(!tbody) return; tbody.innerHTML = '';
    resetStaffClaims();
    activeClusterAssignments = [];

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
        appendRowToTable(tbody, index++, role, "cluster");
    });
}

// 📋 توليد وبناء جدول كادر المجموعة الداخلي آلياً حسب الفئة الحاكمة
function renderGroupStaffTable() {
    var category = document.getElementById('g_category').value;
    var tbody = document.getElementById('groupTableBody');
    if(!tbody) return; tbody.innerHTML = '';
    activeGroupAssignments = [];

    if(!category) {
        tbody.innerHTML = '<tr><td colspan="3" class="table-placeholder">يرجى تحديد "الفئة المعتمدة للمجموعة" لتوليد كادرها آلياً...</td></tr>';
        return;
    }
    resetStaffClaims();
    var roles = customRules[category] || [];
    var index = 1;
    roles.forEach(function(role) {
        appendRowToTable(tbody, index++, role.trim(), "group");
    });
}

// 🛠️ خوارزمية التسكين الذكي في أسطر الجداول وتوليد روابط الواتساب الفورية
function appendRowToTable(tbody, rowIndex, role, type) {
    var tr = document.createElement('tr');
    var assignedName = "لم يُعين الاسم";
    var phoneNo = "غير مدرج";
    var waHTML = '<span style="color:#999; font-size:12px;">🚫 رقم الهاتف غير مدرج</span>';

    // البحث المرن عن الصفات والوظائف المدمجة من مصفوفة السحابة
    var match = staffDb.find(function(s) { 
        return (s.الصفة === role || s.الصفة === "منسق ومعاون" || s.الصفة === "معاون بعدد" || s.الصفة === "موجه ديني - مرشد ديني") && !s.isTaken; 
    });

    if(match) {
        assignedName = match.الاسم; 
        phoneNo = match.الهاتف;
        match.isTaken = true;
        var phone = String(match.الهاتف).replace(/\s+/g, '').replace('+', '');
        var encodedMsg = encodeURIComponent("السلام عليكم أخي الإداري المعتمد / " + assignedName + "، بصفتك (" + role + ") نرجو المتابعة الميدانية المعتمدة.");
        waHTML = '<a href="https://wa.me' + phone + '?text=' + encodedMsg + '" target="_blank" class="whatsapp-link">💬 مراسلة واتساب (' + assignedName + ')</a>';
    }

    // حفظ السجل الحالي للتقرير
    var record = { "الرقم": rowIndex, "الصفة الوظيفية": role, "الاسم المعين": assignedName, "رقم الجوال": phoneNo };
    if(type === "cluster") activeClusterAssignments.push(record);
    else activeGroupAssignments.push(record);

    tr.innerHTML = '<td>' + rowIndex + '</td><td><b>' + role + '</b></td><td>' + waHTML + '</td>';
    tbody.appendChild(tr);
}

// 📊 المحرك الذكي لجمع الهيكل الإداري بالكامل وتصديره لملف Excel معتمد ومبوب بنقرة واحدة
function exportFullClusterReport() {
    var clusterName = document.getElementById('c_name').value || "التكتل الرئيسي";
    var leaderName = document.getElementById('c_leader_select').value || "لم يُعين";
    var groupName = document.getElementById('g_name').value || "المجموعة الداخلية";
    
    // بناء وتنسيق مصفوفة البيانات الكبرى للاعتماد الرسمي
    var summaryData = [
        ["تقرير اعتماد التشكيل والتكتلات الميدانية - مديرية الحج والعمرة"],
        [""],
        ["اسم التكتل الرئيسي:", clusterName, "رئيس التكتل المعتمد:", leaderName],
        ["مكتب تسجيل التكتل:", document.getElementById('c_registration_office').value || "غير محدد", "رقم هاتف الرئيس:", document.getElementById('c_leader_phone').value || "غير محدد"],
        ["إجمالي المجموعات المنضوية:", document.getElementById('c_groups_num').value, "عدد فئات التكتل:", document.getElementById('c_categories_num').value],
        [""],
        ["كادر التكتل الرئيسي المعتمد ميدانياً:"],
        ["الرقم", "الصفة الوظيفية", "الاسم المعين الفعلي", "رقم الجوال الفعال"]
    ];

    // إدراج صفوف كادر التكتل
    activeClusterAssignments.forEach(item => {
        summaryData.push([item.Raqam || item["الرقم"], item["الصفة الوظيفية"], item["الاسم المعين"], item["رقم الجوال"]]);
    });

    summaryData.push([""]);
    summaryData.push(["تفاصيل المجموعات الفرعية تحت هذا التكتل:"]);
    summaryData.push(["اسم المجموعة الحالية:", groupName, "الفئة الممنوحة:", document.getElementById('g_category').value || "غير محدد"]);
    summaryData.push(["رئيس المجموعة المعتمد:", document.getElementById('g_leader_select').value || "لم يُعين", "مكتب تسجيل المجموعة:", document.getElementById('g_registration_office').value || "غير محدد"]);
    summaryData.push([""]);
    summaryData.push(["كادر المجموعة الداخلي الموزع آلياً حسب الفئة:"]);
    summaryData.push(["الرقم", "الصفة الوظيفية بالمجموعة", "الاسم المعين الفعلي", "رقم الجوال الفعال"]);

    // إدراج صفوف كادر المجموعات الداخلية
    activeGroupAssignments.forEach(item => {
        summaryData.push([item.Raqam || item["الرقم"], item["الصفة الوظيفية"], item["الاسم المعين"], item["رقم الجوال"]]);
    });

    // استخدام مكتبة SheetJS لتشييد وبناء ملف الإكسل
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(summaryData);
    
    XLSX.utils.book_append_sheet(wb, ws, "تقرير التشكيل المعتمد");
    
    // حفظ وتحميل الملف تلقائياً يحمل مسمى التكتل الحالي لإدارتك الرسمية
    var fileName = "تقرير_اعتماد_" + clusterName.replace(/\s+/g, '_') + ".xlsx";
    XLSX.writeFile(wb, fileName);
}

// 📄 توليد وتحميل القوالب الفارغة والافتراضية للمشرف العام
function downloadExcelTemplate(type) {
    var headers = []; var filename = "";
    if(type === 'staff') {
        headers = [["الاسم", "الصفة", "الهاتف"]]; filename = "نموذج_قائمة_الكوادر_المعتمدين_الفارغ.xlsx";
    } else {
        headers = [["الفئة", "Kader_Required"]]; filename = "نموذج_ملف_القواعد_الافتراضي.xlsx";
    }
    var wb = XLSX.utils.book_new(); var ws = XLSX.utils.aoa_to_sheet(headers);
    if(type === 'rules') {
        XLSX.utils.sheet_add_aoa(ws, [
            ["1", "موجه ديني"], ["2", "موجه ديني,معاون"],
            ["3", "موجه ديني,موجه ديني,معاون"], ["4", "معاون,معاون,معاون,موجه ديني,موجه ديني"]
        ], {origin: -1});
    }
    XLSX.utils.book_append_sheet(wb, ws, "Template"); XLSX.writeFile(wb, filename);
}

// 🔄 تصفير وإعادة تهيئة المنصة حركياً بالكامل
function resetEntireSystem() {
    if(confirm("هل أنت متأكد من تصفير المنصة بالكامل؟")) { location.reload(); }
}
