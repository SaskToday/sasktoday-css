(function () {
  if (document.getElementById('radio-live-listen-styles')) return;
  var style = document.createElement('style');
  style.id = 'radio-live-listen-styles';
  style.textContent = '/* ----- Radio Live listen widget minify CSS ----- */\n.animate-bars{display:flex;align-items:center;width:200px;height:70px;overflow:hidden;background-color:transphrant;padding:0 10px}.animate-bars div{border-radius:5px;flex:1 0 auto;height:100%;margin:0 4px;background-color:rgba(255,255,255,.8);animation:1.7s linear infinite alternate animate-bar;transform-origin:bottom;opacity:0}.radio-bars{position:relative;overflow:visible}.radio-CKRM.radio-bars::after{content:"Listen Live To 620 CKRM";background-color:#003361;color:#fff}.radio-CFWF.radio-bars::after{content:"LISTEN LIVE TO THE WOLF 104.9";background-color:#a8872f;color:#fff}.radio-CHMX.radio-bars::after{content:"listen live to play92";background-color:#931578;color:#fff;text-transform:lowercase!important}.radio-CFWD.radio-bars::after{content:"LISTEN LIVE TO 96.3 CRUZ FM";background-color:#ed2e3a;color:#fff}.radio-CJGX.radio-bars::after{content:"LISTEN LIVE TO GX94";background-color:#ed1c24;color:#fff}.radio-CFGW.radio-bars::after{content:"LISTEN LIVE TO CRUZ YORKTON";background-color:#ed2e3a;color:#fff}.radio-bars::after{font-family:"Source Sans 3",sans-serif!important;display:inline-block;position:absolute;width:100%;padding:2px 5px 1px;text-align:center;color:#fff;font-size:12px;font-weight:600;border-radius:5px;margin:0 auto 0 -10px;text-transform:uppercase}#now-playing-widget{display:flex;align-items:center;background:#111;color:#fff;padding:10px;border-radius:8px;max-width:320px}#now-playing-widget .artwork img{width:70px;height:70px;object-fit:contain;border-radius:0;margin-right:10px}#radio-live-listen-block a{text-decoration:none}#radio-live-listen-block{margin:0 auto 10px;display:inline-block}.animate-bars div:first-child{margin-left:0;animation-duration:888ms;animation-delay:357ms}.animate-bars div:last-child{margin-right:0}.animate-bars div:nth-child(2){animation-duration:932ms;animation-delay:233ms}.animate-bars div:nth-child(3){animation-duration:976ms;animation-delay:28ms}.animate-bars div:nth-child(4){animation-duration:716ms;animation-delay:366ms}.animate-bars div:nth-child(5){animation-duration:752ms;animation-delay:163ms}.animate-bars div:nth-child(6){animation-duration:856ms;animation-delay:298ms}.animate-bars div:nth-child(7){animation-duration:756ms;animation-delay:498ms}.animate-bars div:nth-child(8){animation-duration:815ms;animation-delay:329ms}.animate-bars div:nth-child(9){animation-duration:593ms;animation-delay:171ms}.animate-bars div:nth-child(10){animation-duration:601ms;animation-delay:42ms}.animate-bars div:nth-child(11){animation-duration:807ms;animation-delay:106ms}.animate-bars div:nth-child(12){animation-duration:461ms;animation-delay:19ms}.animate-bars div:nth-child(13){animation-duration:655ms;animation-delay:434ms}.animate-bars div:nth-child(14){animation-duration:993ms;animation-delay:66ms}.animate-bars div:nth-child(15){animation-duration:463ms;animation-delay:422ms}.animate-bars div:nth-child(16){animation-duration:944ms;animation-delay:213ms}.animate-bars div:nth-child(17){animation-duration:922ms;animation-delay:370ms}.animate-bars div:nth-child(18){animation-duration:835ms;animation-delay:372ms}.animate-bars div:nth-child(19){animation-duration:985ms;animation-delay:404ms}.animate-bars div:nth-child(20){animation-duration:627ms;animation-delay:423ms}.animate-bars div:nth-child(21){animation-duration:895ms;animation-delay:124ms}.animate-bars div:nth-child(22){animation-duration:912ms;animation-delay:425ms}.animate-bars div:nth-child(23){animation-duration:999ms;animation-delay:350ms}.animate-bars div:nth-child(24){animation-duration:855ms;animation-delay:329ms}.animate-bars div:nth-child(25){animation-duration:611ms;animation-delay:415ms}.animate-bars div:nth-child(26){animation-duration:945ms;animation-delay:466ms}.animate-bars div:nth-child(27){animation-duration:933ms;animation-delay:223ms}.animate-bars div:nth-child(28){animation-duration:639ms;animation-delay:389ms}.animate-bars div:nth-child(29){animation-duration:568ms;animation-delay:225ms}.animate-bars div:nth-child(30){animation-duration:820ms;animation-delay:239ms}.animate-bars div:nth-child(31){animation-duration:517ms;animation-delay:170ms}.animate-bars div:nth-child(32){animation-duration:469ms;animation-delay:396ms}.animate-bars div:nth-child(33){animation-duration:695ms;animation-delay:431ms}.animate-bars div:nth-child(34){animation-duration:667ms;animation-delay:63ms}.animate-bars div:nth-child(35){animation-duration:954ms;animation-delay:298ms}.animate-bars div:nth-child(36){animation-duration:719ms;animation-delay:413ms}.animate-bars div:nth-child(37){animation-duration:681ms;animation-delay:386ms}.animate-bars div:nth-child(38){animation-duration:648ms;animation-delay:21ms}.animate-bars div:nth-child(39){animation-duration:544ms;animation-delay:268ms}.animate-bars div:nth-child(40){animation-duration:917ms;animation-delay:367ms}.animate-bars-center div{transform-origin:center}@keyframes animate-bar{0%{transform:scaleY(0);opacity:.8}100%{transform:scaleY(100%);opacity:.8}}';
  document.head.appendChild(style);
})();

$(document).ready(function() {
  // Get the current URL and pathname
  var url = window.location.href;
  var pathname = window.location.pathname;

  // Split pathname into segments and filter out empty strings
  var segments = pathname.split('/').filter(function(segment) {
    return segment !== '';
  });

  // Get the first parameter (index 0)
  var firstParam = segments[0];

  /* console.log('URL:', url);
  console.log('Path segments:', segments);
  console.log('First parameter:', firstParam); */

  // Define HTML content for each region
  var var_north = `
    <div id="radio-live-listen-block"><a href="https://listen.streamon.fm/cfwd?utm_source=sasktoday&utm_medium=widget&utm_campaign=radio-live-listen&utm_content=tune-in-music-cfwd&utm_term=north-communities" target="_blank"><div id="now-playing-widget"><div class="artwork"><img alt="Album Art" id="np-art" src="https://vmdev-media.azurewebsites.net/f/files/sasktoday/images/cfwd.png"></div><div class="info"><div class="animate-bars animate-bars-center radio-CFWD radio-bars"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></a></div>
  `;

  var var_eastcentral = `
    <div id="radio-live-listen-block"><a href="https://listen.streamon.fm/cjgx?utm_source=sasktoday&utm_medium=widget&utm_campaign=radio-live-listen&utm_content=tune-in-music-cjgx&utm_term=eastcentral-communities" target="_blank"><div id="now-playing-widget"><div class="artwork"><img alt="Album Art" id="np-art" src="https://vmdev-media.azurewebsites.net/f/files/sasktoday/images/cjgx.png"></div><div class="info"><div class="animate-bars animate-bars-center radio-bars radio-CJGX"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></a></div><div id="radio-live-listen-block"><a href="https://listen.streamon.fm/cfgw?utm_source=sasktoday&utm_medium=widget&utm_campaign=radio-live-listen&utm_content=tune-in-music-cfgw&utm_term=eastcentral-communities" target="_blank"><div id="now-playing-widget"><div class="artwork"><img alt="Album Art" id="np-art" src="https://vmdev-media.azurewebsites.net/f/files/sasktoday/images/cfgw.png"></div><div class="info"><div class="animate-bars animate-bars-center radio-bars radio-CFGW"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></a></div>
  `;

  var var_southwest = `
    <div id="radio-live-listen-block"><a href="https://listen.streamon.fm/ckrm?utm_source=sasktoday&utm_medium=widget&utm_campaign=radio-live-listen&utm_content=tune-in-music-ckrm&utm_term=southwest-communities" target="_blank"><div id="now-playing-widget"><div class="artwork"><img alt="Album Art" id="np-art" src="https://vmdev-media.azurewebsites.net/f/files/sasktoday/images/logo-ckrm-w-128.png"></div><div class="info"><div class="animate-bars animate-bars-center radio-bars radio-CKRM"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></a></div><div id="radio-live-listen-block"><a href="https://listen.streamon.fm/cfwf?utm_source=sasktoday&utm_medium=widget&utm_campaign=radio-live-listen&utm_content=tune-in-music-cfwf&utm_term=southwest-communities" target="_blank"><div id="now-playing-widget"><div class="artwork"><img alt="Album Art" id="np-art" src="https://vmdev-media.azurewebsites.net/f/files/sasktoday/images/cfwf.png"></div><div class="info"><div class="animate-bars animate-bars-center radio-bars radio-CFWF"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></a></div><div id="radio-live-listen-block"><a href="https://listen.streamon.fm/chmx?utm_source=sasktoday&utm_medium=widget&utm_campaign=radio-live-listen&utm_content=tune-in-music-chmx&utm_term=southwest-communities" target="_blank"><div id="now-playing-widget"><div class="artwork"><img alt="Album Art" id="np-art" src="https://vmdev-media.azurewebsites.net/f/files/sasktoday/images/chmx.png"></div><div class="info"><div class="animate-bars animate-bars-center radio-bars radio-CHMX"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></a></div>
  `;

  var var_southeast = `
    <div id="radio-live-listen-block"><a href="https://listen.streamon.fm/ckrm?utm_source=sasktoday&utm_medium=widget&utm_campaign=radio-live-listen&utm_content=tune-in-music-ckrm&utm_term=southeast-communities" target="_blank"><div id="now-playing-widget"><div class="artwork"><img alt="Album Art" id="np-art" src="https://vmdev-media.azurewebsites.net/f/files/sasktoday/images/logo-ckrm-w-128.png"></div><div class="info"><div class="animate-bars animate-bars-center radio-CKRM radio-bars"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></a></div>
  `;

  // Determine which HTML to insert based on the first parameter
  var htmlToInsert = '';
  switch (firstParam) {
    case 'north':
      htmlToInsert = var_north;
      break;
    case 'saskatoon-today':
      htmlToInsert = var_north;
      break;
    case 'central':
      htmlToInsert = var_eastcentral;
      break;
    case 'southwest':
      htmlToInsert = var_southwest;
      break;
    case 'southeast':
      htmlToInsert = var_southeast;
      break;
    case 'regina-today':
      htmlToInsert = var_southwest;
      break;
    default:
      console.log('No matching region found for:', firstParam);
      return;
  }

var heading = '<h2 class="title mb-1">Tune In for Great Music!</h2>';
htmlToInsert = heading + htmlToInsert;

  // ⏳ Use setInterval to wait for .widget-poll to appear
  var checkExist = setInterval(function() {
    var $pollDiv = $('.widget.widget-poll');
    if ($pollDiv.length > 0) {
      $pollDiv.before(htmlToInsert);
      console.log('Custom HTML inserted before .widget-poll div for region:', firstParam);
      clearInterval(checkExist); // stop checking once inserted
    } else {
      // console.log('Waiting for .widget-poll to appear...');
    }
  }, 300); // check every 300ms until found

  // ⏱️ Stop checking after 5 seconds even if not found
  setTimeout(function() {
    clearInterval(checkExist);
    console.log('widget-poll section not found.');
  }, 15000);
});
