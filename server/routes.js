const User = require('./db/controllers/user.js');
const Episode = require('./db/controllers/episode.js')
const db = require('./db/config.js');
const Promise = require('bluebird');
const request = require('request');
const path = require('path');
const podcastData = require('./requestPodcastData.js');

const root = (req, res) => {
  const index = path.join(__dirname, '../public/index.pug');
  console.log(req.user, req.isAuthenticated());
  res.status(200).render(index, {username: req.user});
};

// routes for subscriptions
const getSubscriptions = (req, res) => {
  // returns a user's subscriptions
  var username = req.user.username;
  User.findOne(username, function(err, user) {
    if (err) {
      console.log('The find User error is: ', err);
    }
    res.json(user.subscriptions);
  });
};

const addSubscription = (req, res) => {
  // adds a channel to a user's subscriptions
  var username = req.user.username;
  var subscription = req.body.channel;
  User.addSubscription(username, subscription, function(err, user) {
    if (err) {
      console.log('The add Subscription error is: ', err);
    }
    res.sendStatus(201).end();
  });
};

const removeSubscription = (req, res) => {
  // adds a channel to a user's subscriptions
  var username = req.user.username;
  var subscription = req.body.channel;
  User.removeSubscription(username, subscription, function(err, user) {
    if (err) {
      console.log('The remove Subscription error is: ', err);
    }
    res.end();
  });
};


// routes for channel data
const getEpisodes = (req, res) => {
  // grabs rss data, scrapes it, and returns array of episodes
  const channel = req.params.channelId;
  const episodes = podcastData.feedGenerator(channel, function(err, result) {
    if (err) {
      res.sendStatus(400).end();
      console.log('nothing is being sent');
    }
    res.status(200).json(result);
  });
};

const login = (accessToken, refreshToken, profile, done) => {
  const username = profile.username;
  User.findOne(username, (err, user) => {
    if (err) {
      return done(err, null);
    }
    if (!user) {
      const userToSave = {
        username: username,
        subscriptions: []
      };

      User.addOne(userToSave, (err, user) => {
        if (err) {
          console.log('nothing found');
          return done(err, null);
        }
        if (user) {
          console.log(username, 'saved');
        }
      });
    }
  });

  done(null, profile);
};

const logout = (req, res) => {
  req.session.passport = null;
  res.redirect('/');
};

const topPodcasts = (req, res) => {
  podcastData.getTopPodcasts((podcasts) => res.json(podcasts));
};

const addToQueue = (req, res) => {
  console.log('added to queue')
  const username = req.user.username;
  const episode = req.body.episode;
  //if episode does not already exist in database...
    //Episode.addOne(episode)...then...
      //User.findOne(username) --> User.addToQueue(episodeId)
}


module.exports = {
  root: root,
  getSubscriptions: getSubscriptions,
  addSubscription: addSubscription,
  removeSubscription: removeSubscription,
  getEpisodes: getEpisodes,
  login: login,
  logout: logout,
  topPodcasts: topPodcasts,
  addToQueue: addToQueue
};
