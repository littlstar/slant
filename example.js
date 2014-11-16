
var el = document.querySelector('#video');
var video = slant.createPlayer(el, {
  src: 'video.mp4'
  //src: 'test.webm'
});

video.render();

