const socket = io();

const message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      output = document.getElementById('output'),
      typing = document.getElementById('typing'),
      button = document.getElementById('button');

      message.addEventListener('keypress', () => {
        socket.emit('userTyping', handle.value)
      })

      button.addEventListener('click', () => {
          socket.emit('userMessage', {
              handle: handle.value,
              message: message.value
          })
          document.getElementById('message').value="";
      })


      socket.on("userMessage", (data) => {
          typing.innerHTML = "";
          output.innerHTML += '<p> <strong>' + data.handle + ': </strong>' + data.message + '</p>'
      })

      socket.on('userTyping', (data) => {
         typing.innerHTML = '<p><em>' + data + ' is typing...</em></p>' 
      })

      function getlVideo(callbacks) {
          navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
          var constraints = {
              audio: true,
              video: true
          }
          navigator.getUserMedia(constraints, callbacks.success, callbacks.error)
      }
      function recStream(stream, elmid) {
          var video = document.getElementById(elmid);

          video.srcObject = stream;

          window.peer_stream = stream;
      }
      getlVideo({
          success: function(stream) {
              window.localstream = stream;
              recStream(stream, 'lVideo');
          },
          error: function(err) {
              alert("Cannot access your camera");
              console.log(err);
          }
      })

      var conn;
      var peer_id;

      // create a peer connection with peer obj
      var peer = new Peer(); 

      //display the peer id on the DOM
      peer.on('open', function() {
          document.getElementById("displayId").innerHTML = peer.id;
      });

      peer.on('connection', function(connection) {
          conn = connection;
          peer_id = connection.peer

          document.getElementById('connId').value = peer_id;
      });
      peer.on('error', function(err){
          alert('Error has happened: ' + err);
          console.log(err);
      })

      // on click with the connection butt = expose ice info
      document.getElementById('conn_button').addEventListener('click', function() {
          peer_id = document.getElementById("connId").value;
          
          if (peer_id) {
              conn = peer.connect(peer_id);
          } else {
              alert('Enter ID');
              return false
          }
      })

      // call on click
      peer.on('call', function(call) {
          var acceptCall = confirm("Do you want to answer this call?");
          if (acceptCall) {
              call.answer(window.localstream);

              call.on('stream', function(stream){
                  window.peer_stream = stream;

                  recStream(stream, 'rVideo');
              });
              call.on('close', function(){
                  alert("This call has behind");
              })
          } else {
              console.log('Call denied');
          }
      });

      // ask to call
      document.getElementById('call_button').addEventListener('click', function(){
          console.log('Calling a peer: ' + peer_id);
          console.log(peer);

          var call = peer.call(peer_id, window.localstream);

          call.on('stream', function(stream){
              window.peer_stream = stream;

              recStream(stream, 'rVideo');
          })
      })