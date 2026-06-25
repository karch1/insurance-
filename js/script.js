// 이미지 모달 열기
function openModal() {
    document.getElementById('imageModal').style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 뒷배경 스크롤 방지
}

// 이미지 모달 닫기
function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.body.style.overflow = 'auto'; // 스크롤 복구
}

// 폼 제출 이벤트
function handleFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;

    // [추후 파이어베이스 DB 연동 시 데이터 저장을 처리할 영역]
    // 예: db.collection("consultations").add({ name: name, phone: phone, date: new Date() })
    
    alert(`${name}님, 상담 신청이 정상 접수되었습니다. 곧 연락드리겠습니다!`);
    
    // 입력창 초기화
    document.getElementById('consultForm').reset();
}
