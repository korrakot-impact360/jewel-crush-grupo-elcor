ig.module('plugins.font.font-info')
.requires('impact.impact')
.defines(function(){
    ig.FontInfo = ig.Class.extend({
        //Include font infos here
        fonts: [
            {name: 'montserrat', source: 'media/fonts/montserrat'}
        ],

        init: function(){
            this.registerCssFont();
        },

        /**Register font using css */
        registerCssFont: function(){
            var fontTypes = [
                {ext:'woff', format:"woff"},
                {ext:'ttf', format:"truetype"},
                {ext:'eot', format:"embedded-opentype"},
                {ext:'woff2', format:"woff2"},
                {ext:'svg#svgFontName', format:"svg"}
            ];

            this.fonts = [];
            for(var fontName in fonts){
                var data = {}
                data.name = fonts[fontName];
                data.source = 'media/fonts/' + fonts[fontName]
                this.fonts.push(data)
            }

            if(this.fonts.length > 0){
                var newStyle = document.createElement('style');
                newStyle.type = "text/css"; 
                var textNode = '';
                for (var i = 0; i < this.fonts.length; i++) {
                    var font = this.fonts[i];
                    textNode += "@font-face {font-family: '" + font.name + "';src:" 
                    for(var k = 0; k < fontTypes.length; k++){
                        var type = fontTypes[k]
                        var txt = "url('" + font.source + "." + type.ext + "') format('"+ type.format + "')";
                        if(k < fontTypes.length - 1){
                            txt += ','
                        }
                        textNode += txt;
                    }

                    textNode += "}"
                }

                newStyle.appendChild(document.createTextNode(textNode));
                document.head.appendChild(newStyle);
            }
        },

        isValid: function(){
            for (var i = 0; i < this.fonts.length; i++) {
                var font = this.fonts[i];
                if(!this._isValidName(font.source))
                    return false;
            }
            return true;
        },
        
        _isValidName: function(name){
            var regexp = /^[a-z0-9-\/]+$/;
            var check = name;
            if (check.search(regexp) == -1)
                return false;
            else
                return true;
        },
    });
});