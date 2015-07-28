var Player = require('./models/player.js');

module.exports = function(app){
	app.get('/', function(req, res) {
		res.render('index');
	});

	app.post('/save',function(req,res){
		var p = new Player({
			name: req.body.name,
			level: req.body.level,
			ccp: req.body.ccp
		});

		p.save(function(err){
			if(err){
				res.json({success: false, message: err});
			}else{
				Player.aggregate(
			    [
		        { "$sort": { "level": -1, "ccp": -1 }}
			    ],
			    function(err,result) {
			      if(err){
			      	res.json({success: false, message: err})
			      }else{
			      	res.json({success: true, message: '', players: result});
			      }
			    }
				);
			}
		});
	});

	app.get('/getplayers', function(req,res){
		Player.aggregate(
	    [
        { "$sort": { "level": -1, "ccp": -1 }}
	    ],
	    function(err,result) {
	      if(err){
	      	res.json({success: false, message: err})
	      }else{
	      	res.json({success: true, message: '', players: result});
	      }
	    }
		);
	});
};