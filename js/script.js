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

// 폼 제출 이벤트 (추후 파이어베이스 연동)
function handleFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;

    // [여기에 파이어베이스 저장 로직이 들어갑니다]
    alert(`${name}님, 비대면 상담 신청이 완료되었습니다!`);
    
    // 입력창 초기화 후 다시 첫 화면으로 이동
    document.getElementById('consultForm').reset();
    goToMain();
}
