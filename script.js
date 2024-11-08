const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let currentColor = "rgba(255, 255, 0, 0.5)"; // 默认黄色（自我）
let circles = [];
let activeCircle = null;
let isDragging = false;
let touchStartDistance = 0;

// 选择黄色圆形（自我）
document.getElementById("selectYellow").addEventListener("click", () => {
    currentColor = "rgba(255, 255, 0, 0.5)";
});

// 选择绿色圆形（自然）
document.getElementById("selectGreen").addEventListener("click", () => {
    currentColor = "rgba(0, 255, 0, 0.5)";
});

// 撤销最后一步
document.getElementById("undo").addEventListener("click", () => {
    if (circles.length > 0) {
        circles.pop();
        drawCircles();
        updateInfo();
    }
});

// 触摸开始
canvas.addEventListener("touchstart", (event) => {
    const touches = event.touches;
    if (touches.length === 1) {
        const { offsetX, offsetY } = getTouchPosition(event);
        handleSingleTouchStart(offsetX, offsetY);
    } else if (touches.length === 2) {
        handlePinchStart(touches);
    }
});

// 触摸移动
canvas.addEventListener("touchmove", (event) => {
    const touches = event.touches;
    if (touches.length === 1) {
        const { offsetX, offsetY } = getTouchPosition(event);
        handleSingleTouchMove(offsetX, offsetY);
    } else if (touches.length === 2) {
        handlePinchMove(touches);
    }
});

// 触摸结束
canvas.addEventListener("touchend", () => {
    isDragging = false;
    activeCircle = null;
    touchStartDistance = 0;
});

// 获取触摸位置
function getTouchPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
    };
}

// 单指触摸开始
function handleSingleTouchStart(x, y) {
    activeCircle = circles.find(
        (circle) => Math.hypot(x - circle.x, y - circle.y) < circle.radius
    );
    if (!activeCircle && circles.length < 2) {
        activeCircle = { x, y, radius: 0, color: currentColor };
        circles.push(activeCircle);
    }
    isDragging = true;
}

// 单指触摸移动
function handleSingleTouchMove(x, y) {
    if (!activeCircle) return;

    if (isDragging && activeCircle.radius === 0) {
        activeCircle.radius = Math.hypot(x - activeCircle.x, y - activeCircle.y);
    } else if (isDragging) {
        activeCircle.x = x;
        activeCircle.y = y;
    }
    drawCircles();
    updateInfo();
}

// 双指捏合开始
function handlePinchStart(touches) {
    const [touch1, touch2] = touches;
    touchStartDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
    );
}

// 双指捏合移动
function handlePinchMove(touches) {
    if (!activeCircle) return;

    const [touch1, touch2] = touches;
    const newDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
    );

    const scaleFactor = newDistance / touchStartDistance;
    activeCircle.radius *= scaleFactor;
    touchStartDistance = newDistance;

    drawCircles();
    updateInfo();
}

// 绘制所有圆形
function drawCircles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((circle, index) => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color;
        ctx.fill();

        // 显示圆心和名称
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(
            index === 0 ? "自我" : "自然",
            circle.x,
            circle.y + circle.radius + 15
        );
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();
    });
}

// 更新页面信息
function updateInfo() {
    let natureArea = 0,
        selfArea = 0,
        overlapArea = 0,
        overlapRatio = 0,
        distance = 0;

    if (circles.length >= 1) {
        selfArea = Math.PI * Math.pow(circles[0].radius, 2);
    }

    if (circles.length === 2) {
        const [circle1, circle2] = circles;
        natureArea = Math.PI * Math.pow(circle2.radius, 2);
        distance = Math.hypot(circle2.x - circle1.x, circle2.y - circle1.y);

        const d = distance;
        const r1 = circle1.radius;
        const r2 = circle2.radius;

        if (d < r1 + r2) {
            if (d <= Math.abs(r1 - r2)) {
                overlapArea = Math.PI * Math.pow(Math.min(r1, r2), 2);
            } else {
                const angle1 = 2 * Math.acos((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d));
                const angle2 = 2 * Math.acos((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d));
                const area1 = 0.5 * r1 * r1 * (angle1 - Math.sin(angle1));
                const area2 = 0.5 * r2 * r2 * (angle2 - Math.sin(angle2));
                overlapArea = area1 + area2;
            }
        }

        overlapRatio = overlapArea / (selfArea + natureArea);
    }

    document.getElementById("natureArea").textContent = natureArea.toFixed(2);
    document.getElementById("selfArea").textContent = selfArea.toFixed(2);
    document.getElementById("areaRatio").textContent = (
        (natureArea / selfArea) || 0
    ).toFixed(2);
    document.getElementById("overlapArea").textContent = overlapArea.toFixed(2);
    document.getElementById("overlapRatio").textContent = overlapRatio.toFixed(2);
    document.getElementById("distance").textContent = distance.toFixed(2);
}
