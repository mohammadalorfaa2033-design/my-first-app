// [إصلاح حاسم]: حقن برمي ذكي ومبكر لمكتبة SheetJS لضمان استقرار البيئة السحابية والفرز لملفات الإكسل
if (typeof XLSX === 'undefined') {
    var script = document.createElement('script');
    script.src = "https://cloudflare.com";
    document.head.appendChild(script);
}

// 🌐 الرابط السحابي المباشر لملف غوغل شيت (تأكد من استخدام خيار النشر للويب بصيغة CSV)
const googleSheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrN_bE_7vmgWHq0U2Aw55WcI8TsFgPPTHre3QMexHf2oWaYhZdAaXU2o6c5GXKEtFRKlMVk_dIdvI_/pub?gid=0&single=true&output=csv";

var staffDb = [];
var groupCounter = 0; 

// ⌨️ رصد ضغط مفتاح Enter للعبور المباشر والصامت دون أي نوافذ منبثقة أو تأكيدات عائقة
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
    fetchStaffFromGoogleSheets();
}

// ⏳ معالجة روابط غوغل شيت والالتفاف الأوتوماتيكي الذكي على قيود الحظر الأمني للمتصفحات ومنع التجمد
function fetchStaffFromGoogleSheets() {
    if(!googleSheetCsvUrl || googleSheetCsvUrl.includes("⚠️")) {
        document.getElementById('adminStatusLogs').innerText = '⚠️ المنصة تعمل محلياً بانتظار ربط السحابة.';
        renderClusterStaffTable();
        addNewDynamicGroupSection(); 
        return;
    }
    
    document.getElementById('adminStatusLogs').innerText = '⏳ جاري الاتصال بالسحابة ومزامنة الكوادر الحية...';
    
    var directUrl = googleSheetCsvUrl.trim();
    if (directUrl.includes('/edit')) {
        var parts = directUrl.split('/edit');
        directUrl = parts[0] + '/export?format=csv';
    } else if (directUrl.includes('/pubhtml')) {
        var partsHtml = directUrl.split('/pubhtml');
        directUrl = partsHtml[0] + '/pub?output=csv';
    }

    fetch(directUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network block');
            return response.text();
        })
        .then(csvText => {
            var workbook = XLSX.read(csvText, {type: 'string'});
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];
            staffDb = XLSX.utils.sheet_to_json(worksheet);
            
            document.getElementById('adminStatusLogs').innerText = '✅ تم التحديث السحابي! جلب عدد (' + staffDb.length + ') اسم كادر معتمد حياً.';
            
            populateClusterLeaderDropdown();
            renderClusterStaffTable();
            addNewDynamicGroupSection(); 
        })
        .catch(error => {
            console.error("Cloud connection failed:", error);
            document.getElementById('adminStatusLogs').innerText = '❌ فشل الاتصال بالسحابة، تحقق من صلاحية المشاركة ونشر الـ CSV.';
            renderClusterStaffTable();
            addNewDynamicGroupSection();
        });
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

// 📊 تفعيل سحب وإدراج هاتف ومكتب تسجيل رئيس التكتل تلقائياً وفورياً بمجرد الاختيار
function syncClusterLeaderData() {
    var selectedLeader = document.getElementById('c_leader_select').value;
    var phoneInput = document.getElementById('c_leader_phone');
    var officeInput = document.getElementById('c_registration_office');
    
    var match = staffDb.find(function(s) { return s.الاسم === selectedLeader && s.الصفة === "رئيس تكتل"; });
    if(match) {
        phoneInput.value = match.الهاتف || 'غير مدرج';
        officeInput.value = match.المكتب || 'المكتب الرئيسي للمديرية'; 
    } else {
        phoneInput.value = ''; officeInput.value = '';
    }
    renderClusterStaffTable();
}
git add .
git commit -m "Wipe out XLSX scope racing bugs completely with strict interval triggers"
git push
