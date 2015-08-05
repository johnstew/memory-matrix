var canvas  = document.getElementById('canvas');
var ctx     = canvas.getContext('2d');
var CWIDTH  = canvas.width = 500;
var CHEIGHT = canvas.height = 500;
var CENTERX = window.innerWidth/2;
var CENTERY = window.innerHeight/2;
var mainHeadLine = document.getElementById('headline');
var startContainer = document.querySelector('.start-container');


startContainer.style.top = (mainHeadLine.offsetTop+mainHeadLine.offsetHeight+40)+'px';

// center canvas
var CLEFT = canvas.style.left = (CENTERX - (CWIDTH/2))+'px';
var CTOP = canvas.style.top = (mainHeadLine.offsetTop+mainHeadLine.offsetHeight+40)+'px';
var selectedValues = [];
var level = 1;
var gridSize = 3;
var selectedSize = 3;
var revealTime = 1000;
var levelComplete = false;
var games = { active: null };
var rightClicks = 0;
var totalClicks = 0;

function shuffle(o){
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
}

function fillSelected(){
	for(var i = 0; i < (selectedSize*selectedSize); i++){
		selectedValues.push(i);
	}
	// shuffle
	shuffle(selectedValues);
	// remove size squares from selected values
	for(var j = 0; j < (selectedSize*selectedSize)-selectedSize; j++){
		var rando = Math.floor(Math.random() * ((selectedSize+1) - 0)) + 0;
		selectedValues.splice(rando, 1);
	}
}


function Square(x,y,w,h,id) {
  this.x = x;
  this.y = y;
  this.color = '#1976D2';
  this.selectedColor = '#90CAF9';
  this.rightColor = '#4CAF50';
  this.wrongColor = '#F44336';
  this.strokeColor = '#0D47A1';
  this.width = w;
  this.height = h;
  this.selected = false;
  this.clicked = false;
  this.id = id;
}

Square.prototype.render = function(){
	ctx.beginPath();
  ctx.rect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = this.color;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = this.strokeColor;
  ctx.stroke();
};


Square.prototype.showSelected = function(){
	if(this.selected){
		ctx.beginPath();
	  ctx.rect(this.x, this.y, this.width, this.height);
	  ctx.fillStyle = this.selectedColor;
	  ctx.fill();
	  ctx.lineWidth = 1;
	  ctx.strokeStyle = this.strokeColor;
	  ctx.stroke();
	}
};

Square.prototype.hideSelected = function(){
	if(this.selected){
		ctx.beginPath();
	  ctx.rect(this.x, this.y, this.width, this.height);
	  ctx.fillStyle = this.color;
	  ctx.fill();
	  ctx.lineWidth = 1;
	  ctx.strokeStyle = this.strokeColor;
	  ctx.stroke();
	}
};

Square.prototype.showRightClick = function(){
	ctx.beginPath();
  ctx.rect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = this.rightColor;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = this.strokeColor;
  ctx.stroke();
};

Square.prototype.showWrongClick = function(){
	ctx.beginPath();
  ctx.rect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = this.wrongColor;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = this.strokeColor;
  ctx.stroke();
};

Square.prototype.setSelected = function(selected){
	this.selected = selected;
};

Square.prototype.inBoundingBox = function(mousecoords){
	if((mousecoords.x > this.x) && (mousecoords.x < (this.x + this.width))){
		if((mousecoords.y > this.y) && (mousecoords.y < (this.y + this.height))){
			return true;
		}
	}
	return false;
};

function Grid(size){
	this.size = size;
	this.squares = [];
}

Grid.prototype.create = function(){
	var x = 1;
	var y = 1;
	var padding = Math.floor(CWIDTH / this.size);
	var id = 0;

	// create selected values
	fillSelected(selectedSize);

	// setup grid
	for(var r = 0; r < this.size; r++){
		for(var c = 0; c < this.size; c++){
			var square = new Square(x,y,padding,padding,id);
			for(var s = 0; s < selectedValues.length; s++){
				if(square.id == selectedValues[s]){
					square.setSelected(true);
				}
			}
			this.squares.push(square);
			x += padding;
			id++;
		}
		y += padding;
		x = 1;
	}
};

Grid.prototype.render = function(){
	for(var i = 0; i < this.squares.length; i++){
		this.squares[i].render();
	}
};

Grid.prototype.listen = function(){
	var root = this;	
};

Grid.prototype.update = function(){
	for(var i = 0; i < this.squares.length; i++){
		this.squares[i].update();
	}
};

Grid.prototype.showSelected = function(){
	var root = this;
	for(var i = 0; i < this.squares.length; i++){
		this.squares[i].showSelected();
	}

	setTimeout(function(){
		for(var j = 0; j < root.squares.length; j++){
			root.squares[j].hideSelected();		
		}
	}, revealTime);
};

function Game(level,size){
	this.level = level;
	this.size = size;
	this.grid = new Grid(this.size);
}

Game.prototype.createGame = function(){
	this.grid.create();
	this.grid.render();
	this.grid.showSelected();
};

Game.prototype.listen = function(){
	var root = this;
	canvas.onclick = function(e){
		var gridX = (e.clientX - parseInt(canvas.style.left));
		var gridY = (e.clientY - parseInt(canvas.style.top));
		
		for(var j = 0; j < root.grid.squares.length; j++){
			if(root.grid.squares[j].inBoundingBox({x: gridX, y: gridY})){
				totalClicks++;
				if(root.grid.squares[j].selected === true){
					root.grid.squares[j].showRightClick();
					root.grid.squares[j].clicked = true;
					rightClicks++;
					if(root.levelOver()){
						setTimeout(function(){
							root.reset();
							level++;
							nextLevel();
						},1000);
					}
				}else{
					root.grid.squares[j].showWrongClick();
					(function(square){
						setTimeout(function(){
							square.render();
						},200);
					})(root.grid.squares[j]);
				}
			}
		}
		// update scores
		root.showScores();
	};
};

Game.prototype.levelOver = function(){
	var counter = 0;
	for(var i = 0; i < this.grid.squares.length; i++){
		if(this.grid.squares[i].selected){
			if(this.grid.squares[i].clicked){
				counter++;
				if(counter == selectedSize){
					return true;
				}
			}
		}
	}
	return false;
};

Game.prototype.reset = function(){
	ctx.clearRect(0,0,CWIDTH,CHEIGHT);
	canvas.onclick = null;
	selectedValues = [];
};

Game.prototype.showScores = function(){
	var ccpContainer = document.getElementById('ccpscore');
	var ccp = Math.floor((rightClicks / totalClicks)*100);
	var ccpscore = ccp+'<sup>%</sup>';
	ccpContainer.innerHTML = ccpscore;
};


function nextLevel(){
	games.active = null;
	if(level === 1){
		gridSize = 3;
		selectedSize = 3;
	}else if(level === 2){
		gridSize = 4;
		selectedSize = 4;
	}else if(level === 3){
		gridSize = 5;
		selectedSize = 4;
	}else if(level > 3){
		if(level % 2 === 0){
			gridSize += 1;
			selectedSize = gridSize - 1;
		}else{
			gridSize += 1;
			selectedSize = gridSize;
		}
	}
	var levelContainer = document.getElementById('levelscore');
	levelContainer.innerHTML = level;
	var g = new Game(level,gridSize);
	g.createGame();
	g.listen();
	games.active = g;
}

var startButton = document.getElementById('start');
startButton.onclick = function(){
	var startContainer = document.querySelector('.start-container');
	startContainer.classList.add('hide');
	setTimeout(function(){
		nextLevel();
	},600);
};

var saveButton = document.getElementById('savescore');
saveButton.onclick = function(){
	toggleModal(true);
};

var formSubmit = document.getElementById('submit');
formSubmit.onclick = function(){
	var request = new XMLHttpRequest();
	var data = { name: document.getElementById('username').value, level: document.getElementById('levelscore').innerHTML, ccp: parseInt(document.getElementById('ccpscore').innerHTML) };
	request.open('POST', '/save', true);
	request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	request.send(JSON.stringify(data));
	toggleModal(false);
	request.onload = function(){
		var data = JSON.parse(request.responseText);
		buildTopPerformers(data.players);
	};
};

var overlay = document.querySelector('.overlay');
overlay.onclick = function(){
	toggleModal(false);
};

function toggleModal(show){
	if(show){
		document.querySelector('.overlay').classList.add('show');
		document.querySelector('.modal').classList.add('show');
	}else{
		document.querySelector('.overlay').classList.remove('show');
		document.querySelector('.modal').classList.remove('show');
	}
}

function getTopPerformers(){
	var request = new XMLHttpRequest();
	request.open('GET', '/getplayers', true);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    var data = JSON.parse(request.responseText);
	    buildTopPerformers(data.players);
	  } else {
	    console.log('Error!');
	  }
	};
	request.send();
}

function buildTopPerformers(data){
	var html = '';
	var table = document.querySelector('.top-performers table.tp tbody');
	for(var i = 0; i < data.length; i++){
		html += '<tr>';
			html += '<td>'+data[i].name+'</td>';
			html += '<td>'+data[i].level+'</td>';
			html += '<td>'+data[i].ccp+'<sup>%</sup></td>';
		html += '</tr>';
	}
	table.innerHTML = html;
}

// load in scores
getTopPerformers();
