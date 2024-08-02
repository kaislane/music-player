// Defino las variables globales;
let songs = [ // Array de canciones para poder cambiar entre ellas;
  './assets/Tame_Impala_The_less_I_know_the_better.mp3',
  './assets/Brutus_Liar.mp3',
  './assets/MCR_Welcome_to_the_Black_Parade.mp3',
  './assets/Apocalyptica_Path.mp3',
  './assets/Crosses_Bitches_Brew.mp3',
];
let currentSongIndex = 0; // Índice de la canción actual;
let song;
let buttonPlay;
let buttonNext;
let buttonPrev;
let amp;
let fft;
let backgroundColor;
let font;
let progressBarRadius;
let progressBarWidth;
let volumeBarRadius;
let volumeBarWidth;
let isDragging = false; // Variable para saber si se está interactuando con la barra de progreso;
let isDraggingVolume = false; // Variable para saber si se está interactuando con el control de volumen;
let time; // Variable para almacenar la duración de la canción;

const circleSize = 100;

let circles = [];

// Variable para almacenar el volumen actual independiente de la canción;
let currentVolume = 0.75; // Inicializo el volumen al 75%;

// PRELOAD Y SETUP //

function preload() {
  // Cargo las canciones;
  for (let i = 0; i < songs.length; i++) {
    songs[i] = loadSound(songs[i], loaded); // Almaceno cada canción en el array songs;
  }

  // Cargo la fuente;
  font = loadFont('./assets/SpaceMono-Bold.ttf');
}

function loaded() {
  song = songs[currentSongIndex]; // Asigno la canción actual al cargar;
  time = song.duration(); // Obtengo la duración de la canción una vez cargada;
  song.setVolume(0.75); // Establezco el volumen al 75% al cargar la canción;
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Defino los parámetros del sonido que alterarán el fondo y los círculos;
  amp = new p5.Amplitude();
  fft = new p5.FFT(0.8, 128);

  // Creo los círculos;
  let numCircles = 5;
  for (let i = 0; i < numCircles; i++) {
    circles.push(new Circle(width / 2, height / 2, i, numCircles));
  }

  // Inicializo el color de fondo;
  backgroundColor = color(255);

  // Creo el botón central Play/Pause;
  buttonPlay = createButton('play');
  buttonPlay.position(width / 2 - circleSize / 2, height / 2 - circleSize / 2); // Centro el botón;
  buttonPlay.size(circleSize, circleSize);

  // Creo el botón "Next song";
  buttonNext = createButton('next song');
  buttonNext.position(width / 2 - circleSize / 2 + height / 2, height / 2 - circleSize / 2); // Centro el botón;
  buttonNext.size(circleSize, circleSize);

  // Creo el botón "Previous song";
  buttonPrev = createButton('prev song');
  buttonPrev.position(width / 2 - circleSize / 2 - height / 2, height / 2 - circleSize / 2); // Centro el botón;
  buttonPrev.size(circleSize, circleSize);

  // Establezco la fuente para todo el canvas;
  textFont(font);

  // Defino los estilos del botón en un objeto;
  const buttonStyles = {
    'border-radius': '50%',
    'font-size': '20px',
    'background-color': '#fff',
    'color': '000',
    'border': 'none',
    'cursor': 'pointer',
    'line-height': '0.9',
  };

  // Aplico los estilos a los botones;
  for (let property in buttonStyles) {
    buttonPlay.style(property, buttonStyles[property]);
    buttonNext.style(property, buttonStyles[property]);
    buttonPrev.style(property, buttonStyles[property]);
  }

  // Aplico la fuente a los botones usando CSS, porque no lo he conseguido con "textFont(font)"
  buttonPlay.elt.style.fontFamily = 'SpaceMono-Bold, sans-serif'; // Aplico la fuente;
  buttonNext.elt.style.fontFamily = 'SpaceMono-Bold, sans-serif';
  buttonPrev.elt.style.fontFamily = 'SpaceMono-Bold, sans-serif';

  buttonPlay.mousePressed(togglePlay);
  buttonNext.mousePressed(nextSong);
  buttonPrev.mousePressed(prevSong);

  // Establezco el radio y el ancho de la barra de progreso;
  progressBarRadius = height * 0.6;
  progressBarWidth = 20;

  // Establezco el radio y el ancho del control del volumen;
  volumeBarRadius = height * 0.7;
  volumeBarWidth = 10;
}

// FUNCIONES DE LOS BOTONES CIRCULARES //

// Creo la función Play/Pause del botón;
function togglePlay() {
  if (!song.isPlaying()) {
    buttonPlay.html('pause');
    song.play();
  } else {
    buttonPlay.html('play');
    song.pause();
  }
}

// Creo las funciones "nextSong" y "prevSong";
function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length; // Avanza al siguiente índice circularmente;
  changeSong();
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; // Retrocede al índice anterior circularmente;
  changeSong();
}

function changeSong() {
  song.stop(); // Paro la canción actual si está reproduciéndose;
  song = songs[currentSongIndex]; // Cambio a la nueva canción;
  time = song.duration(); // Actualizo la duración de la nueva canción;
  song.setVolume(0.75); // Establezco el volumen al 75% para la nueva canción;
  song.play(); // Reproduzco la nueva canción
}

// DRAW //

function draw() {

  // Calculo el espectro y amplitud una vez por frame;
  let spectrum = fft.analyze();
  let volume = amp.getLevel();

  // Calculo el color de fondo basado en el espectro
  let bass = fft.getEnergy('bass');
  let mid = fft.getEnergy('mid');
  let treble = fft.getEnergy('treble');
  let moodColor = color(
    map(mid, 0, 255, 0, 255),
    map(treble, 0, 255, 0, 255),
    map(bass, 0, 255, 0, 255)
  );

  // Suavizo la transición del color de fondo;
  backgroundColor = lerpColor(backgroundColor, moodColor, 0.05);
  background(backgroundColor);

  // Cambio el color del texto del botón según el color de fondo;
  buttonPlay.elt.style.color = backgroundColor;
  buttonNext.elt.style.color = backgroundColor;
  buttonPrev.elt.style.color = backgroundColor;

  // Actualizo y muestro los círculos;
  for (let circle of circles) {
    circle.update(spectrum, volume);
    circle.show();
  }

  // Dibujo el círculo base de la barra de progreso;
  noFill();
  strokeWeight(progressBarWidth);
  stroke(255, 100);
  arc(width / 2, height / 2, progressBarRadius, progressBarRadius, 0, TWO_PI);

  // Dibujo la barra de progreso circular;
  drawProgressBar();

  // Dibujo el círculo base del control del volumen;
  noFill();
  strokeWeight(volumeBarWidth);
  stroke(255, 100);
  arc(width / 2, height / 2, volumeBarRadius, volumeBarRadius, 0, TWO_PI);

  // Dibujo la barra de control de volumen circular;
  drawVolumeBar();
}

// BARRA DE PROGRESO //

function drawProgressBar() {
  // Calculo la posición del marcador de progreso;
  let progress = song.currentTime() / song.duration();
  let angle = map(progress, 0, 1, -HALF_PI, TWO_PI - HALF_PI);

  // Dibujo la barra de progreso actual;
  noFill();
  strokeWeight(progressBarWidth);
  stroke(255);
  arc(width / 2, height / 2, progressBarRadius, progressBarRadius, -HALF_PI, angle);

  // Actualizo el tiempo de la canción cuando se interactúa con el mouse sobre la barra de progreso;
  if (isDragging) {
    // Creo que un vector que representa la posición del mouse respecto al centro del canvas;
    let mousePos = createVector(mouseX - width / 2, mouseY - height / 2);
    // Obtengo el ángulo de ese vector (en radianes), puede ser negativo;
    let progressAngle = mousePos.heading();
    // Me aseguro que el ángulo está entre -HALF_PI y TWO_PI - HALF_PI;
    if (progressAngle < -HALF_PI) {
      progressAngle += TWO_PI;
    }
    // Convierto el progressAngle al rango de tiempo de la canción;
    let newTime = map(progressAngle, -HALF_PI, TWO_PI - HALF_PI, 0, song.duration());
    song.jump(newTime);
  }
}

// BARRA DE VOLUMEN //

function drawVolumeBar() {
  // Calculo la posición del marcador de volumen;
  let angle = map(currentVolume, 0, 1, -HALF_PI, TWO_PI - HALF_PI);

  // Dibujo la barra de control de volumen actual;
  noFill();
  strokeWeight(volumeBarWidth);
  stroke(255);
  arc(width / 2, height / 2, volumeBarRadius, volumeBarRadius, -HALF_PI, angle);

  // Dibujo un círculo adicional en el punto del arco que indica el estado actual del volumen;
  let cx = width / 2 + cos(angle) * (volumeBarRadius / 2);
  let cy = height / 2 + sin(angle) * (volumeBarRadius / 2);
  fill(255);
  noStroke();
  ellipse(cx, cy, 20, 20);

  // Actualizo el volumen cuando se interactúa con el mouse sobre la barra de control de volumen;
  if (isDraggingVolume) {
    // Creo que un vector que representa la posición del mouse respecto al centro del canvas;
    let mousePos = createVector(mouseX - width / 2, mouseY - height / 2);
    // Obtengo el ángulo de ese vector (en radianes), puede ser negativo;
    let volumeAngle = mousePos.heading();
    // Me aseguro que el ángulo está entre -HALF_PI y TWO_PI - HALF_PI;
    if (volumeAngle < -HALF_PI) {
      volumeAngle += TWO_PI;
    }
    // Convierto el volumeAngle al rango de volumen;
    let newVolume = map(volumeAngle, -HALF_PI, TWO_PI - HALF_PI, 0, 1);
    currentVolume = newVolume; // Actualizo la variable de volumen independiente;
    song.setVolume(currentVolume);
  }
}

// EVENTOS DEL MOUSE //

// Verifico si el mouse está interactuando con alguno de los controles (progreso o volumen);
function mousePressed() {
  let mousePos = createVector(mouseX - width / 2, mouseY - height / 2);
  // Verifico si el mouse está dentro del ancho de la barra de progreso;
  if (mousePos.mag() < progressBarRadius / 2 + progressBarWidth && mousePos.mag() > progressBarRadius / 2 - progressBarWidth) {
    isDragging = true;
  }
  // Verifico si el mouse está dentro del ancho de la barra de control de volumen;
  if (mousePos.mag() < volumeBarRadius / 2 + volumeBarWidth && mousePos.mag() > volumeBarRadius / 2 - volumeBarWidth) {
    isDraggingVolume = true;
  }
}

function mouseReleased() {
  isDragging = false;
  isDraggingVolume = false;
}

// REDIMENSIONAMIENTO DE LA VENTANA //

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reposiciono los círculos al redimensionar la ventana;
  for (let circle of circles) {
    circle.updatePosition(width / 2, height / 2);
  }
  // Reposiciono los botones al redimensionar la ventana;
  buttonPlay.position(width / 2 - circleSize / 2, height / 2 - circleSize / 2);
  buttonNext.position(width / 2 - circleSize / 2 + height / 2, height / 2 - circleSize / 2);
  buttonPrev.position(width / 2 - circleSize / 2 - height / 2, height / 2 - circleSize / 2);

  // Reposiciono la barra de progreso;
  progressBarRadius = height * 0.6;

  // Reposiciono la barra de volumen;
  volumeBarRadius = height * 0.7;

  // Redibujo la pantalla
  draw();
}

// CÍRCULOS AL RITMO Y MOOD DE LA MÚSICA //

class Circle {
  // Defino la instancia de los círculos;
  constructor(x, y, index, totalCircles) {
    this.pos = createVector(x, y);
    this.index = index;
    this.totalCircles = totalCircles;
    this.size = random(100, height * 0.5);
    this.opacity = 100;
    this.targetOpacity = 100;
  }

  updatePosition(x, y) {
    this.pos.set(x, y);
  }

  update(spectrum, volume) {
    // Ajusto la opacidad de los círculos según volumen;
    this.targetOpacity = map(volume, 0, 1, 50, 255);
    this.opacity = lerp(this.opacity, this.targetOpacity, 0.05);

    // Ajusto el tamaño de los círculos según las frecuencias;
    let lowIndex = int(map(this.index, 0, this.totalCircles, 0, spectrum.length));
    let highIndex = int(map(this.index + 1, 0, this.totalCircles, 0, spectrum.length));
    let energy = 0;
    for (let i = lowIndex; i < highIndex; i++) {
      energy += spectrum[i];
    }
    energy /= (highIndex - lowIndex);

    this.size = map(energy, 0, 255, 100, height * 0.5);
  }

  show() {
    noStroke();
    fill(255, this.opacity);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}

// Atajos de teclado;
function keyPressed() {
  if (key === 'f') {
    let fs = fullscreen();
    fullscreen(!fs);
  }

  if (keyCode === RIGHT_ARROW) {
    nextSong();
  }

  if (keyCode === LEFT_ARROW) {
    prevSong();
  }

  if (keyCode === ENTER) {
    togglePlay();
  }
}
