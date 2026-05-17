//Создание окна и значений денег, хп
const main_window = document.getElementById("main_window");
const ctx = main_window.getContext("2d");
const money_text = document.getElementById("value_money");
const ground_health_text = document.getElementById("value_ground_health");

//Размеры окна
const screen_size = 50;
const rows = 20;
const cols = 20;

//Маштабирование 
main_window.width = cols * screen_size;
main_window.height = rows * screen_size;

const cursor_image = "Pickaxe.png";

const ground_stages = [
    { damage: 0, src: "Ground1.png", image: new Image() },
    { damage: 5, src: "Ground2.png", image: new Image() },
    { damage: 10, src: "Ground3.png", image: new Image() },
    { damage: 15, src: "Ground4.png", image: new Image() },
    { damage: 20, src: "Ground5.png", image: new Image() },
    { damage: 25, src: "Ground6.png", image: new Image() },
    { damage: 30, src: "Ground7.png", image: new Image() },
    { damage: 35, src: "Ground8.png", image: new Image() },
    { damage: 40, src: "Ground9.png", image: new Image() },
    { damage: 45, src: "Ground10.png", image: new Image() },
    { damage: 50, src: "Ground11.png", image: new Image() },
    { damage: 60, src: "Ground12.png", image: new Image() },
    { damage: 70, src: "Ground13.png", image: new Image() },
    { damage: 80, src: "Ground14.png", image: new Image() },
    { damage: 90, src: "Ground15.png", image: new Image() }
];

const player_image = new Image();
const images = [player_image, ...ground_stages.map((stage) => stage.image)];

let loaded_images = 0;
let game_ready = false;
let money = 0;
let animation_frame_id = null;
let player_image_ready = true;

const ground = {
    row: 5,
    damage: 0,
    max_damage: 100,
    click_flash: 0
};

const player = {
    x: 10,
    y: ground.row - 1
};

function getGroundY(){
    return ground.row * screen_size;
}

function placePlayerOnGround(){
    player.y = Math.max(0, ground.row - 1);
}

function getMousePosition(event){
    const rect = main_window.getBoundingClientRect();
    const mouse_x = event.clientX - rect.left;
    const mouse_y = event.clientY - rect.top;
    const scale_x = main_window.width / rect.width;
    const scale_y = main_window.height / rect.height;

    return {
        x: mouse_x * scale_x,
        y: mouse_y * scale_y
    };
}

function isGroundPoint(point){
    return (
        point.x >= 0 &&
        point.x <= main_window.width &&
        point.y >= getGroundY() &&
        point.y <= main_window.height
    );
}

function updateCursor(event){
    const point = getMousePosition(event);

    if(isGroundPoint(point)){
        main_window.style.cursor = `url("${cursor_image}") 8 8, pointer`;
    }
    else{
        main_window.style.cursor = "default";
    }
}

function getCurrentGroundStage(){
    let current_stage = ground_stages[0];

    for(const stage of ground_stages){
        if(ground.damage >= stage.damage){
            current_stage = stage;
        }
    }

    return current_stage;
}

function updateGroundHealthText(){
    ground_health_text.textContent = ground.max_damage - ground.damage;
}

function damageGround(){
    if(ground.damage >= ground.max_damage){
        return;
    }

    ground.damage++;
    ground.click_flash = 0.28;
    money++;
    money_text.textContent = money;
    updateGroundHealthText();
    draw();
    startFlashAnimation();
}

function movePlayer(direction){
    const next_x = player.x + direction;

    if(next_x < 0 || next_x >= cols){
        return;
    }

    player.x = next_x;
    placePlayerOnGround();
    draw();
}

function drawGround(){
    const ground_y = getGroundY();
    const ground_height = main_window.height - ground_y;
    const current_stage = getCurrentGroundStage();
    const ground_pattern = ctx.createPattern(current_stage.image, "repeat");
    const darkness = Math.min(ground.click_flash, 0.55);

    ctx.save();
    ctx.fillStyle = ground_pattern;
    ctx.fillRect(0, ground_y, main_window.width, ground_height);

    ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
    ctx.fillRect(0, ground_y, main_window.width, ground_height);
    ctx.restore();
}

function drawPlayer(){
    if(player_image_ready){
        ctx.drawImage(
            player_image,
            player.x * screen_size,
            player.y * screen_size,
            screen_size,
            screen_size
        );
    }
    else{
        ctx.fillStyle = "#d8a15d";
        ctx.fillRect(
            player.x * screen_size,
            player.y * screen_size,
            screen_size,
            screen_size
        );
    }
}

function draw(){
    if(!game_ready){
        return;
    }

    ctx.clearRect(0, 0, main_window.width, main_window.height);

    drawGround();
    drawPlayer();
}

function animateFlash(){
    ground.click_flash = Math.max(0, ground.click_flash - 0.025);
    draw();

    if(ground.click_flash > 0){
        animation_frame_id = requestAnimationFrame(animateFlash);
    }
    else{
        animation_frame_id = null;
    }
}

function startFlashAnimation(){
    if(animation_frame_id === null){
        animation_frame_id = requestAnimationFrame(animateFlash);
    }
}

function imageLoaded(){
    loaded_images++;

    if(loaded_images === images.length){
        game_ready = true;
        placePlayerOnGround();
        updateGroundHealthText();
        draw();
    }
}

for(const image of images){
    image.onload = imageLoaded;
    image.onerror = imageLoaded;
}

main_window.addEventListener("mousemove", updateCursor);
main_window.addEventListener("mouseleave", () => {
    main_window.style.cursor = "default";
});

main_window.addEventListener("click", (event) => {
    const point = getMousePosition(event);

    if(isGroundPoint(point)){
        damageGround();
    }
});

document.addEventListener("keydown", (event) => {
    if(event.key === "ArrowLeft" || event.key.toLowerCase() === "a"){
        movePlayer(-1);
    }

    if(event.key === "ArrowRight" || event.key.toLowerCase() === "d"){
        movePlayer(1);
    }
});

player_image.onerror = () => {
    player_image_ready = false;
    imageLoaded();
};

player_image.src = "Player.png";

for(const stage of ground_stages){
    stage.image.src = stage.src;
}
