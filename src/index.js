const constraints = {
    video: {

      facingMode: "environment"
    }
  };
  const video =document.getElementById('video');

async function getDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
        const updatedConstraints = {
          ...constraints,
        //   deviceId: {
        //     exact: videoDevices[0]
        //   }
        };
        const stream = await navigator.mediaDevices.getUserMedia(updatedConstraints);
        video.srcObject = stream
        video.play();
      }


  }




    function opencvIsReady(){
        getDevices();
        document.getElementById('status').innerHTML="loaded ";
    }