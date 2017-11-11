//Keyboard component
//Original Author:David Nemes
//http://nmsdvid.com/aframe-keyboard/
AFRAME.registerComponent('keyboard', {
    schema: {
        receiver: {type: 'string', default: 'receiver'},
        visibility: {type: 'bool', default: 'true'}
    },
    init: function () {
        var thisEl = this; //scene
        var thisElData = thisEl.data;
        var elHeight = thisEl.el.getAttribute('height');
        var elWidth = thisEl.el.getAttribute('width');
        thisEl.el.setAttribute('visible', thisElData.visibility);

        var alphabet = ["A", "B", "C", "D", "E", "F", "G" , "H" , "I" , "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

        var height = (elHeight/2)-0.1;
        var inc = 0;
        var position;

        for (i = 0; i < alphabet.length; i++) {

            //- keyboard width + char box width + desired space btw char boxes
            if(-(elWidth/2)+(0.1) + (inc*0.15) > (elWidth/2)){
                inc = 0;
                height = (height - 0.22);
            }

            position = -(elWidth/2)+(0.1) + (inc*0.15) +' '+height+' 0.100';

            //create alphabet boxes
            var char = document.createElement('a-box');
            char.setAttribute('class', 'keyboard-el');
            char.setAttribute('color', '#079BE5');
            char.setAttribute('height', '0.1');
            char.setAttribute('width', '0.1');
            char.setAttribute('radius', '0.1');
            char.setAttribute('position', position);
            char.setAttribute('data-char', alphabet[i]);
            thisEl.el.appendChild(char);

            //create alphabet characters
            var text = document.createElement('a-text');
            text.setAttribute('color', 'white');
            text.setAttribute('width', '2');
            text.setAttribute('radius', '0.1');
            text.setAttribute('position', '-0.045 0 0.5');
            text.setAttribute('value', alphabet[i]);
            char.appendChild(text);


            inc = inc + 1;
        }

        //create return button
        var returnBtn = document.createElement('a-box');
        returnBtn.setAttribute('class', 'keyboard-el');
        returnBtn.setAttribute('color', '#079BE5');
        returnBtn.setAttribute('height', '0.15');
        returnBtn.setAttribute('width', '0.35');
        returnBtn.setAttribute('id', 'enter');
        returnBtn.setAttribute('position', -(elWidth/2)+(0.22) +" "+(height-0.2)+" 0.100"); //-0.2 = el height + gap
        thisEl.el.appendChild(returnBtn);

        //create return Btn Text
        var returnBtnText = document.createElement('a-text');
        returnBtnText.setAttribute('color', 'white');
        returnBtnText.setAttribute('width', '2');
        returnBtnText.setAttribute('position', '-0.14 0 0.5');
        returnBtnText.setAttribute('value', 'Return');
        returnBtn.appendChild(returnBtnText);


        var receiver =  document.getElementById(thisElData.receiver);
        var elements = thisEl.el.querySelectorAll('a-box[data-char]');

        for (var i = 0; i < elements.length; i++) {
            elements[i].addEventListener('click', function(){
                var receiverValue = receiver.getAttribute('value');
                var receiverValueChar = receiver.dataset.char;

                if(receiverValue){

                    receiver.setAttribute('value', receiverValue + this.dataset.char);

                    if(receiverValueChar){
                        receiver.setAttribute('data-char', receiverValueChar + this.dataset.char);
                    }else {
                        receiver.setAttribute('data-char', this.dataset.char);
                    }
                }else {
                    receiver.setAttribute('value', this.dataset.char);
                    receiver.setAttribute('data-char', this.dataset.char);
                }

            }, false);


        }

        //add hover effect on keyboard elements
        var keyboardEls = document.querySelectorAll('.keyboard-el');
        for(var i=0;i<keyboardEls.length;i++){

            keyboardEls[i].addEventListener('mouseenter', function () {
                this.setAttribute('material', 'color', '#057ab4');
            });

            keyboardEls[i].addEventListener('mouseleave', function () {
                this.setAttribute('material', 'color', '#079BE5');
            });
        }

        document.querySelector('#enter').addEventListener('click', function(){
            thisEl.el.emit('submited', {submited: true}, false);
            thisEl.el.setAttribute('visible', 'false');
        }, false);

    },
    update: function () {
        this.el.setAttribute('visible', this.data.visibility);
    }
});