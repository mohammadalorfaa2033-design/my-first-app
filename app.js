// 🌐 الرابط السحابي الخاص بملف غوغل شيت (بصيغة CSV المخصصة للنشر)
const googleSheetCsvUrl = "⚠️ ضع_هنا_رابط_الـ_CSV_الذي_نسخته_من_خطوة_النشر ⚠️";

var staffDb = [];
var customRules = { 
    "1": ["موجه ديني"], 
    "2": ["موجه ديني", "معاون"], 
    "3": ["موجه ديني", "موجه ديني", "معاون"], 
    "4": ["معاون", "معاون", "معاون", "موجه ديني", "موجه ديني"] 
};

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

function authenticateUserGateway() {
    var inputCode = document.getElementById('accessPasscode').value.trim();
    var authGate = document.getElementById('gatekeeperSystem');
    var mainPlatform = document.getElementById('mainHajjPlatform');
    var superAdminSection = document.getElementById('superAdminSection');

    if (!inputCode) {
        alert("⚠️ فضلاً، أدخل رمز الصلاحية أولاً!");
        return;
    }

    if (inputCode === "main123456") {
        authGate.style.display = 'none';
        mainPlatform.style.display = 'block';
        superAdminSection.style.display = 'none'; 
        initializePlatformUI();
    } else if (inputCode === "admn123") {
        authGate.style.display = 'none';
        mainPlatform.style.display = 'block';
        superAdminSection.style.display = 'block'; 
        initializePlatformUI();
    } else {
        alert("❌ رمز الصلاحية المكتوب غير مسجل بنظام المديرية!");
    }
}

function initializePlatformUI() {
    document.getElementById('liveDate').innerText = new Date().toISOString().split('T')[0];
    fetchStaffFromGoogleSheets();
}

function fetchStaffFromGoogleSheets() {
    if(googleSheetCsvUrl.includes("⚠️")) {
        alert("⚠️ يرجى لصق رابط الـ CSV الفعلي داخل ملف app.js لتشغيل المزامنة السحابية.");
        renderClusterStaffTable();
        return;
    }
    
    document.getElementById('adminStatusLogs').innerText = '⏳ جاري الاتصال بالسحابة ومزامنة الكوادر الحية...';
    
    fetch(googleSheetCsvUrl)
        .then(response => response.text())
        .then(csvText => {
            var workbook = XLSX.read(csvText, {type: 'string'});
            var worksheet = workbook.Sheets[workbook.SheetNames[0]];
            staffDb = XLSX.utils.sheet_to_json(worksheet);
            
            document.getElementById('adminStatusLogs').innerText = '✅ تم التحديث السحابي بنجاح! جلب عدد (' + staffDb.length + ') اسم كادر معتمد حياً.';
            populateDropdownMenus();
            renderClusterStaffTable();
            renderGroupStaffTable();
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById('adminStatusLogs').innerText = '❌ فشل الاتصال بالسحابة، تحقق من إعدادات مشاركة الملف ونشره.';
            alert("⚠️ حدث خطأ أثناء جلب الكوادر السحابية، سيتم تشغيل المنصة بالبيانات الافتراضية.");
            renderClusterStaffTable();
        });
}

function populateDropdownMenus() {
    var leaderSelect = document.getElementById('c_leader_select');
    var assistantSelect = document.getElementById('c_assistant_select');
    var groupLeaderSelect = document.getElementById('g_leader_select');

    leaderSelect.innerHTML = '<option value="">-- ابحث واختر رئيس التكتل --</option>';
    assistantSelect.innerHTML = '<option value="">-- ابحث واختر معاون التكتل --</option>';
    groupLeaderSelect.innerHTML = '<option value="">-- ابحث واختر رئيس المجموعة --</option>';

    staffDb.forEach(function(person) {
        if(person.الصفة === "رئيس تكتل") {
            leaderSelect.innerHTML += '<option value="' + person.الاسم + '">' + person.الاسم + '</option>';
        }
        if(person.الصفة === "معاون" || person.الصفة === "منسق ومعاون" || person.الصفة === "معاون بعدد") {
            assistantSelect.innerHTML += '<option value="' + person.الاسم + '">' + person.الاسم + '</option>';
        }
        if(person.الصفة === "رئيس مجموعة") {
            groupLeaderSelect.innerHTML += '<option value="' + person.الاسم + '">' + person.الاسم + '</option>';
        }
    });
}

function downloadExcelTemplate(type) {
    var headers = [];
    var filename = "";
    
    if(type === 'staff') {
        headers = [["الاسم", "الصفة", "الهاتف"]];
        filename = "نموذج_قائمة_الكوادر_المعتمدين_الفارغ.xlsx";
    } else {
        headers = [["الفئة", "Kader_Required"]];
        filename = "نموذج_ملف_القواعد_الافتراضي.xlsx";
    }

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(headers);
    
    if(type === 'rules') {
        XLSX.utils.sheet_add_aoa(ws, [
            ["1", "موجه ديني"],
            ["2", "موجه ديني,معاون"],
            ["3", "موجه ديني,موجه ديني,معاون"],
            ["4", "معاون,معاون,معاون,موجه ديني,موجه ديني"]
        ], {origin: -1});
    }

    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, filename);
}

function resetStaffClaims() {
    staffDb.forEach(function(s) { s.isTaken = false; });
}

function renderClusterStaffTable() {
    var tbody = document.getElementById('clusterTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    resetStaffClaims();

    var coords = parseInt(document.getElementById('c_coord_num').value) || 0;
    var guides = parseInt(document.getElementById('c_guides_num').value) || 0;

    var clusterRoles = [];
    for(var i=1; i<=coords; i++) clusterRoles.push("منسق");
    for(var j=1; j<=guides; j++) clusterRoles.push("موجهة دينية");

    clusterRoles.forEach(function(role) {
        appendRowToTable(tbody, role, "تنبيه علوي وتنسيق لكوادر التكتل الرئيسي العام.");
    });
}

function renderGroupStaffTable() {
    var category = document.getElementById('g_category').value;
    var tbody = document.getElementById('groupTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    if(!category) {
        tbody.innerHTML = '<tr><td colspan="3" style="color:#666; font-style:italic;">يرجى تحديد "الفئة الممنوحة للمجموعة" لتوليد كادرها آلياً...</td></tr>';
        return;
    }

    resetStaffClaims();

    var roles = customRules[category] || [];
    roles.forEach(function(role) {
        appendRowToTable(tbody, role.trim(), "متابعة الموقف الميداني للمجموعة.");
    });
}

function appendRowToTable(tbody, role, defaultMsg) {
    var tr = document.createElement('tr');
    var name = "لم يُعين الاسم (يرجى مراجعة ترويسات الغوغل شيت)";
    var waHTML = '<span style="color:#999; font-size:12px;">🚫 رقم الهاتف غير مدرج</span>';

    var match = staffDb.find(function(s) { 
        return (s.الصفة === role || s.الصفة === "منسق ومعاون" || s.الصفة === "معاون بعدد" || s.الصفة === "موجه ديني - مرشد ديني") && !s.isTaken; 
    });

    if(match) {
        name = match.الاسم; 
        match.isTaken = true;
        var phone = String(match.الهاتف).replace(/\s+/g, '').replace('+', '');
        var encodedMsg = encodeURIComponent("السلام عليكم أخي الإداري المعتمد / " + name + "، بصفتك (" + role + ") نرجو المتابعة الميدانية الفورية. " + defaultMsg);
        waHTML = '<a href="https://wa.me' + phone + '?text=' + encodedMsg + '" target="_blank" class="whatsapp-link">💬 مراسلة واتساب (' + name + ')</a>';
    }

    tr.innerHTML = '<td><b>' + role + '</b></td><td>' + waHTML + '</td><td style="color:#888; font-style:italic;">نشط ومربوط ببيانات السحابة..</td>';
    tbody.appendChild(tr);
}

function syncClusterLeaderName() {
    renderClusterStaffTable();
}

function resetEntireSystem() {
    if(confirm("هل أنت متأكد من تصفير المنصة ومسح الكوادر والقوائم المسجلة؟")) {
        staffDb = [];
        document.getElementById('g_name').value = '';
        document.getElementById('g_category').value = '';
        document.getElementById('g_sector').value = '';
        document.getElementById('g_office').value = '';
        document.getElementById('c_leader_select').innerHTML = '<option value="">-- ابحث واختر رئيس التكتل --</option>';
        document.getElementById('c_assistant_select').innerHTML = '<option value="">-- ابحث واختر معاون التكتل --</option>';
        document.getElementById('g_leader_select').innerHTML = '<option value="">-- ابحث واختر رئيس المجموعة --</option>';
        document.getElementById('adminStatusLogs').innerText = '';
        renderClusterStaffTable();
        renderGroupStaffTable();
        alert("تم تصفير النظام بنجاح! 🔄");
    }
}
