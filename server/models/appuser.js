'use strict';

const path = require('path');
const loopback = require('loopback');

const frontendUrl = 'http://localhost:4200';
const backendUrl = 'http://localhost:3000';

module.exports = function (Appuser) {
  Appuser.beforeRemote('findById', function (req, res, next) {
    req.args.filter({ include: ['superuser'] });
    next();
  });
  Appuser.beforeRemote('create', function (context, user, next) {
    context.args.data.role = 'owner';
    next();
  });
  Appuser.afterRemote('create', function (context, user, next) {
    const verifyLink =
      backendUrl +
      'api/appusers/confirm?uid=' +
      user.id +
      '&redirect=' +
      frontendUrl;
    var options = {
      type: 'mail',
      to: user.email,
      from: 'consul.hati@gmail.com',
      subject: 'Thanks for your regiter',
      host: 'localhost',
      template: path.resolve(__dirname, '../boot/views/verify.ejs'),
      user: user,
      verifyHref: verifyLink,
    };
    user.verify(options, function (err, response) {
      if (err) {
        Appuser.deleteById(user.id);
        return next(err);
      }
      user.superuser.create(
        {
          username: user.username,
        },
        function (err, resp) {
          console.log('superuser created');
          Appuser.findById(resp.superuserid, function (err, result) {
            result.superuserid = resp.id;
            Appuser.upsert(result, function (err, user) {});
          });
        }
      );
      next();
    });
  });
};
