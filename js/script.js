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

// 폼 제출 이벤트 (현재는 로컬 테스트용, 추후 파이어베이스 연동)
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

    // 3. 만약 체크박스를 하나도 안 골랐다면 기본 문구 세팅
    const interestList = selectedTypes.length > 0 ? selectedTypes.join(', ') : "선택 안 함";

    /* =========================================================
       🔒 [추후 파이어베이스 연동 시 이 영역에 들어갈 실제 코드 예시]
       =========================================================
       db.collection("consultations").add({
           name: name,
           phone: phone,
           interests: selectedTypes,
           memo: memo,
           date: new Date()
       });
    */
    
    // 4. 로컬 테스트용 알림창 (체크박스와 메모가 잘 수집되는지 눈으로 확인!)
    alert(
        `🎉 상담 신청 접수 완료! (로컬 테스트)\n\n` +
        `• 성함: ${name}\n` +
        `• 연락처: ${phone}\n` +
        `• 관심 분야: ${interestList}\n` +
        `• 한줄 메모: ${memo}`
    );
    
    // 5. 입력창 완전히 비워주고 깔끔하게 첫 화면(팜플렛)으로 리턴
    document.getElementById('consultForm').reset();
    goToMain();
}
