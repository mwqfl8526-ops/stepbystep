/**************************
 *      ROLES & KEYS
 **************************/
window.ROLES = {  
    GUIDE: { key: 'GUIDE', name: 'مرشد سياحي' },  
    COMPANION: { key: 'COMPANION', name: 'مرافق لذوي الاحتياجات الخاصة' },  
    DRIVER: { key: 'DRIVER', name: 'سائق نقل خاص' },  
    CHEF: { key: 'CHEF', name: 'طباخ' }  
};

window.KEYS = {  
    JOB_APPLICATIONS: 'jobApplications',  
    HOTELS: 'hotels',  
    RESTAURANTS: 'restaurants',  
    STORES: 'stores',  
    COMPLAINTS: 'complaints',  
    EMERGENCIES: 'emergencies',  
    ASSISTANTS_GUIDES: 'assistantsGuides',  
    ASSISTANTS_COMPANIONS: 'assistantsCompanions',  
    ASSISTANTS_DRIVERS: 'assistantsDrivers',  
    CHATS: 'chats',  
    TICKET_CODES: 'ticketCodes',  
    COMMENTS: 'comments'  
};

/**************************
 *   BASE STORAGE FUNCTIONS
 **************************/
window.loadData = function() {
    let data = {};
    for (const key of Object.values(window.KEYS)) {
        const stored = localStorage.getItem(key);
        try {
            data[key] = stored 
                ? JSON.parse(stored) 
                : (key === window.KEYS.CHATS || key === window.KEYS.COMMENTS ? {} : []);
        } catch (e) {
            console.error("Error parsing stored data for key:", key, e);
            data[key] = (key === window.KEYS.CHATS || key === window.KEYS.COMMENTS ? {} : []);
        }
    }
    return data;
};

window.saveDataToStorage = function(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error("Error saving data for key:", key, e);
        return false;
    }
};

/**************************
 *   PLACE FUNCTIONS (HOTELS/RESTAURANTS/STORES)
 **************************/
window.generateBookingCode = function(prefix, index) {
    return prefix + (1000 + index);
};

window.generateBookingPassword = function() {
    return Math.random().toString(36).substring(2,8).toUpperCase();
};

window.savePlace = function(saveKey, placeData) {
    try {
        const data = window.loadData();
        const list = data[saveKey] || [];
        const index = list.length;
        placeData.bookingCode = window.generateBookingCode(saveKey.substring(0,3), index);
        placeData.bookingPassword = window.generateBookingPassword();
        list.push(placeData);
        if(window.saveDataToStorage(saveKey, list)){
            return { code: placeData.bookingCode, password: placeData.bookingPassword };
        }
        return false;
    } catch(e) {
        console.error("Error saving place:", e);
        return false;
    }
};

/**************************
 *       BOOKINGS
 **************************/
window.saveBooking = function(saveKey, bookingData) {
    try {
        if(!saveKey || !bookingData) return false;
        const data = window.loadData();
        const bookingsKey = saveKey + '_BOOKINGS';
        if(!data[bookingsKey]) data[bookingsKey] = [];
        data[bookingsKey].push({...bookingData, time: new Date().toLocaleString('ar-EG',{timeZone:'Africa/Cairo'})});
        return window.saveDataToStorage(bookingsKey, data[bookingsKey]);
    } catch(e) {
        console.error("Error saving booking:", e);
        return false;
    }
};

window.getBookings = function(saveKey){
    const data = window.loadData();
    const bookingsKey = saveKey + '_BOOKINGS';
    return data[bookingsKey] || [];
};

/**************************
 *       COMMENTS
 **************************/
window.saveComment = function(saveKey, placeCode, commentData) {
    if(!saveKey || !placeCode || !commentData) return false;
    const data = window.loadData();
    if (!data[window.KEYS.COMMENTS][saveKey]) data[window.KEYS.COMMENTS][saveKey] = {};
    if (!data[window.KEYS.COMMENTS][saveKey][placeCode]) data[window.KEYS.COMMENTS][saveKey][placeCode] = [];
    data[window.KEYS.COMMENTS][saveKey][placeCode].push(commentData);
    return window.saveDataToStorage(window.KEYS.COMMENTS, data[window.KEYS.COMMENTS]);
};

window.getComments = function(saveKey, placeCode) {
    const data = window.loadData();
    if (data[window.KEYS.COMMENTS][saveKey] && data[window.KEYS.COMMENTS][saveKey][placeCode]) {
        return data[window.KEYS.COMMENTS][saveKey][placeCode];
    }
    return [];
};

/**************************
 *   APPLICATION FUNCTIONS
 **************************/
window.getApplicationById = function(id){
    const apps = window.loadData()[window.KEYS.JOB_APPLICATIONS] || [];
    return apps.find(app=>app.id===id);
};

window.updateApplicationStatus = function(id,newStatus){
    try{
        const data = window.loadData();
        const apps = data[window.KEYS.JOB_APPLICATIONS] || [];
        const index = apps.findIndex(app=>app.id===id);
        if(index===-1) return false;
        apps[index].status = newStatus;
        return window.saveDataToStorage(window.KEYS.JOB_APPLICATIONS,apps);
    } catch(e){ console.error(e); return false; }
};

window.deleteApplication = function(id){
    try{
        const data = window.loadData();
        let apps = data[window.KEYS.JOB_APPLICATIONS] || [];
        const initialLength = apps.length;
        apps = apps.filter(app=>app.id!==id);
        if(apps.length<initialLength) return window.saveDataToStorage(window.KEYS.JOB_APPLICATIONS,apps);
        return false;
    } catch(e){ console.error(e); return false; }
};

/**************************
 *       ASSISTANTS
 **************************/
window.generateChatCode = function(){
    return 'CHAT-' + Math.floor(10000 + Math.random()*90000);
};

window.saveNewAssistant = function(roleKey, assistantData){
    try{
        const data = window.loadData();
        let key, assistantList;

        switch(roleKey){
            case window.ROLES.GUIDE.key:
                key = window.KEYS.ASSISTANTS_GUIDES; 
                break;

            case window.ROLES.COMPANION.key:
                key = window.KEYS.ASSISTANTS_COMPANIONS; 
                break;

            case window.ROLES.DRIVER.key:
                key = window.KEYS.ASSISTANTS_DRIVERS; 
                break;

            case window.ROLES.CHEF.key:
                key = "assistantsChefs";
                if(!data[key]) data[key] = [];
                break;

            default:
                return false;
        }

        assistantList = data[key];

        const newId = roleKey.charAt(0) + (assistantList.length + 100);
        const newChatCode = window.generateChatCode();

        assistantData.id = newId;
        assistantData.chatCode = newChatCode;
        assistantData.rating = 5.0;

        assistantList.push(assistantData);
        window.saveDataToStorage(key, assistantList);

        return newChatCode;

    } catch(e){ console.error(e); return false; }
};

/**************************
 *       COMPLAINTS
 **************************/
window.deleteComplaint = function(idToDelete){
    try{
        const data = window.loadData();
        let complaints = data[window.KEYS.COMPLAINTS] || [];
        const newComplaints = complaints.filter(c=>c.id!==idToDelete);
        if(newComplaints.length!==complaints.length) 
            return window.saveDataToStorage(window.KEYS.COMPLAINTS,newComplaints);
        return false;
    } catch(e){ console.error(e); return false; }
};

/**************************
 *   DEFAULT DATA
 **************************/
let defaultGuides = [
    { id: 'G100', chatCode: 'CHAT-10001', name: 'علياء الشامسي', experience: 5, guideType: 'ثقافي', groupLimit: 25, age: 35, price: 450, rating: 4.8, about: "متخصصة في تاريخ الإمارات.", img: 'images/guide_woman.png' },
    { id: 'G101', chatCode: 'CHAT-10002', name: 'يوسف العلي', experience: 10, guideType: 'ترفيهي', groupLimit: 30, age: 40, price: 600, rating: 4.9, about: "خبير بالجولات الثقافية.", img: 'images/guide_man.png' }
];

let defaultCompanions = [
    { id: 'C200', chatCode: 'CHAT-20001', name: 'فاطمة الكعبي', experience: 7, specialization: 'حركي وكبار سن', priceDay: 550, priceHour: 80, rating: 4.7, about: "مساعدة في التنقل.", img: 'images/companion_woman.png' },
    { id: 'C201', chatCode: 'CHAT-20002', name: 'أحمد النعيمي', experience: 3, specialization: 'سمعي وبصري', priceDay: 400, priceHour: 60, rating: 4.5, about: "يجيد لغة الإشارة.", img: 'images/companion_man.png' }
];

let defaultDrivers = [
    { id: 'D300', chatCode: 'CHAT-30001', name: 'سالم المطروشي', age: 45, experience: 20, cityPrice: 300, outCityPrice: 800, rating: 5.0, about: "سائق خاص.", img: 'images/driver_man.png' }
];

let defaultHotels = [];
let defaultRestaurants = [];
let defaultStores = [];

/**************************
 *   INITIALIZE DEFAULTS
 **************************/
window.initializeDefaultData = function(){
    if(!localStorage.getItem(window.KEYS.ASSISTANTS_GUIDES)) 
        window.saveDataToStorage(window.KEYS.ASSISTANTS_GUIDES, defaultGuides);

    if(!localStorage.getItem(window.KEYS.ASSISTANTS_COMPANIONS)) 
        window.saveDataToStorage(window.KEYS.ASSISTANTS_COMPANIONS, defaultCompanions);

    if(!localStorage.getItem(window.KEYS.ASSISTANTS_DRIVERS)) 
        window.saveDataToStorage(window.KEYS.ASSISTANTS_DRIVERS, defaultDrivers);

    if(!localStorage.getItem(window.KEYS.HOTELS)) 
        window.saveDataToStorage(window.KEYS.HOTELS, defaultHotels);

    if(!localStorage.getItem(window.KEYS.RESTAURANTS)) 
        window.saveDataToStorage(window.KEYS.RESTAURANTS, defaultRestaurants);

    if(!localStorage.getItem(window.KEYS.STORES)) 
        window.saveDataToStorage(window.KEYS.STORES, defaultStores);

    if(!localStorage.getItem(window.KEYS.COMMENTS)) 
        window.saveDataToStorage(window.KEYS.COMMENTS,{});

    if(!localStorage.getItem(window.KEYS.CHATS)) 
        window.saveDataToStorage(window.KEYS.CHATS,{});
};

window.initializeDefaultData();
