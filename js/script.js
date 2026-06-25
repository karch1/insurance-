//파이어베이스 초기화 (보내주신 키값을 적용했습니다)

const firebaseConfig = {
    apiKey: "AIzaSyDuCP7XEtUet0ABfgBpv-CVXc3aUOl586s",
    authDomain: "insurance-6676d.firebaseapp.com",
    projectId: "insurance-6676d",
    storageBucket: "insurance-6676d.firebasestorage.app",
    messagingSenderId: "397479316628",
    appId: "1:397479316628:web:e4d70f9b3bf045c9183881"
};

// 파이어베이스 및 파이어스토어(DB) 연동 시작
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// [화면 전환] 기능 함수

// 입력창 화면으로 이동 (팜플렛 숨기고 입력창 띄우기)
function goToForm() {
    document.getElementById('step-main').classList.remove('active');
    document.getElementById('step-form').classList.add('active');
    window.scrollTo(0, 0); // 화면 최상단으로 스크롤 리셋
}

// 메인 팜플렛 화면으로 돌아가기
function goToMain() {
    document.getElementById('step-form').classList.remove('active');
    document.getElementById('step-main').classList.add('active');
    window.scrollTo(0, 0);
}

// 📥 [데이터 전송] 폼 제출 이벤트 (파이어스토어 저장 실행)
function handleFormSubmit(event) {
    event.preventDefault();
    
    // 1. 이름, 연락처, 추가 메모 값 가져오기
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const memo = document.getElementById('clientMemo').value || "없음"; // 적은 게 없으면 '없음' 처리
    
    // 2. 체크박스 중 중복 선택된 보험 유형(값)들을 모두 찾아서 배열로 모으기
    const checkboxes = document.querySelectorAll('input[name="insurance_type"]:checked');
    let selectedTypes = [];
    checkboxes.forEach((checkbox) => {
        selectedTypes.push(checkbox.value);
    });

    // 3. 파이어베이스 저장
    db.collection("consultations").add({
        name: name,
        phone: phone,
        interests: selectedTypes,
        memo: memo,
        createdAt: firebase.firestore.FieldValue.serverTimestamp() // 신청한 실시간 날짜/시간 자동 기록
    })
    .then((docRef) => {
        // 데이터 저장이 완전히 성공했을 때 실행되는 구역!
        alert(`🎉 ${name}님, 맞춤 비대면 상담 신청이 완료되었습니다!`);
        
        // 입력창 완전히 비워주고 깔끔하게 첫 화면(팜플렛)으로 리턴
        document.getElementById('consultForm').reset();
        goToMain();
    })
    .catch((error) => {
        // 혹시나 연결 오류나 권한 문제가 생겼을 때 브라우저 개발자 도구(F12)에 에러를 찍어줌
        console.error("파이어베이스 저장 에러 발생: ", error);
        alert("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    });
}
