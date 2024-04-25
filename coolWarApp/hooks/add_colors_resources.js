#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

module.exports = function(context) {
    var Q = context.requireCordovaModule('q');
    var deferral = new Q.defer();

    var platformRoot = path.join(context.opts.projectRoot, 'platforms/android');
    var colorsFile = path.join(context.opts.projectRoot, 'hooks/colors.xml');
    var resColorsFile = path.join(platformRoot, 'app/src/main/res/values/colors.xml');

    fs.copyFileSync(colorsFile, resColorsFile, (err) => {
        if (err) {
            console.error('Failed to copy colors.xml: ' + err.message);
            deferral.reject();
        } else {
            console.log('Successfully copied colors.xml');
            deferral.resolve();
        }
    });

    return deferral.promise;
};
