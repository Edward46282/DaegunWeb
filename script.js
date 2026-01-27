document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.custom-cursor');
    const interactives = document.querySelectorAll('.interactive, a, button');
    
    // 마우스 커서 따라오는 변수 설정
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // 마우스 포지션 업데이트
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // 마우스 커서 애니메이션 함수
    function animateCursor() {
        // lerp 계산: 현재 위치 + (목표 위치 - 현재 위치) * 속도
        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;

        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        
        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // 마우스 커서 인터랙티브 요소 반응
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '70px';
            cursor.style.height = '70px';
            cursor.style.backgroundColor = 'rgba(255, 77, 0, 0.1)';
            cursor.style.borderColor = 'rgba(255, 77, 0, 0.4)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.backgroundColor = 'transparent';
            cursor.style.borderColor = 'var(--primary)';
        });
    });

    // 우측 nav bar 섹션

    const sections = document.querySelectorAll('section');
    const navDots = document.querySelectorAll('.nav-dot');

    const observerOptions = {
        threshold: 0.5 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navDots.forEach(dot => {
                    dot.querySelector('.dot-indicator').classList.remove('active');
                });
                
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`a[href="#${id}"] .dot-indicator`);

                if(activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    let next = document.querySelector(".next");
    let prev = document.querySelector(".prev");

    next.addEventListener("click", function () {
        let items = document.querySelectorAll(".item");
        document.querySelector(".slide").appendChild(items[0]);
    });

    prev.addEventListener("click", function () {
        let items = document.querySelectorAll(".item");
        document.querySelector(".slide").prepend(items[items.length - 1]);
    });

    // 네비게이션 버튼으로 캐러셀 스크롤

    const carousel = document.querySelector('.work-carousel');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');

    const scrollAmount = 370; 

    if (carousel && nextBtn && prevBtn) {
        const updateButtonState = () => {
            prevBtn.disabled = carousel.scrollLeft <= 0;

            const isAtEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1;
            nextBtn.disabled = isAtEnd;
        };
        
        nextBtn.addEventListener('click', () => {
            carousel.scrollBy({ 
                left: scrollAmount, 
                behavior: 'smooth' 
            });
        });

        prevBtn.addEventListener('click', () => {
            carousel.scrollBy({ 
                left: -scrollAmount, 
                behavior: 'smooth' 
            });
        });

        carousel.addEventListener('scroll', updateButtonState);

        updateButtonState();
    }
});

