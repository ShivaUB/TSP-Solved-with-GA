var canvasWrapper = document.getElementById('canvasWrapper');
var bestRouteWrapper = document.getElementById('bestRouteWrapper');
var btn = document.getElementById('btn');
var params = { width: 400, height: 400 };
var two = new Two(params).appendTo(canvasWrapper);
var twoForBest = new Two(params).appendTo(bestRouteWrapper);
var status;

var cities = [];
var index=0;
var initialCitiesOrder=[];
var population = [];
var bestMember;
var bestFitness=Infinity;
var bestIndex;
var populationSize;
var crossOver;
var mutationRate;
var generations;

canvasWrapper.addEventListener('click',(event)=>{
    if(checkIfCityExists(event.offsetX,event.offsetY)==false)
    {
        const addedCity = new City(index++,event.offsetX,event.offsetY);
        cities.push(addedCity);
        initialCitiesOrder.push(addedCity.name);
        addedCity.drawCircleOnCanvas(two);
    }
})

btn.addEventListener('click',(event)=>{
    populationSize = document.getElementById('populationSize').value;
    crossOver = document.getElementById('crossOverRate').value;
    mutationRate = document.getElementById('mutationRate').value;
    generations= document.getElementById('NoOfGenerations').value;
    canvasWrapper.style.pointerEvents = "none";
    generatePopulation();
    for(let k=0;k<generations;k++){ 
        calculateDistancesForAllPaths();
        figureOutBestFit();
        crossOverAndMutation();
    }
});

function checkIfCityExists(x,y){
    return cities.some((er)=>{
        return (er.xCordinate === x && er.yCordinate === y);
    })
}

class City{
    constructor(name, xCordinate, yCordinate){
        this.name= name;
        this.xCordinate = xCordinate;
        this.yCordinate = yCordinate;
    }
    drawCircleOnCanvas(canvas){
        const circle = canvas.makeCircle(this.xCordinate, this.yCordinate, 5);
        circle.fill = '#FF8000';
        circle.stroke = 'orangered';
        circle.linewidth = 1;
        two.update();
    }
}

class Member{
    constructor(cityArr,pathDistance) {
        this.memberCities=cityArr; 
        this.pathDistance = pathDistance;
    };

    calculatePathDistance(){
        this.pathDistance = Infinity;
        let x1 = this.getCityByName(this.memberCities[0]).xCordinate;
        let y1 = this.getCityByName(this.memberCities[0]).yCordinate;
        var dist = 0;
        for(let i=1; i<this.memberCities.length; i++){
            dist += this.calculateDistanceBetweenTwoPoints(x1,y1,this.getCityByName(this.memberCities[i]).xCordinate,this.getCityByName(this.memberCities[i]).yCordinate);
            x1 = this.getCityByName(this.memberCities[i]).xCordinate;
            y1 = this.getCityByName(this.memberCities[i]).yCordinate;
            if(i==this.memberCities.length-1){
                dist += this.calculateDistanceBetweenTwoPoints(x1,y1,this.getCityByName(this.memberCities[0]).xCordinate,this.getCityByName(this.memberCities[0]).yCordinate);
            }
        }
        this.pathDistance = dist;
        this.drawPathJoiningAllCities(two);
    }

    calculateDistanceBetweenTwoPoints(x1,y1,x2,y2){
        return Math.sqrt(((y2-y1)*(y2-y1)) + ((x2-x1)*(x2-x1)));
    }
    
    getCityByName(name){
        return cities[name];
    }

    drawPathJoiningAllCities(canvas){
        setTimeout(() => {
            canvas.clear();
            this.memberCities.forEach((element,ind) => {
                this.getCityByName(ind).drawCircleOnCanvas(canvas);
            });
            canvas.update();
            let x1 = this.getCityByName(this.memberCities[0]).xCordinate;
            let y1 = this.getCityByName(this.memberCities[0]).yCordinate;
            for(let i=1; i<this.memberCities.length; i++){
                this.drawLineBetweenTwoPoints(canvas,x1,y1,this.getCityByName(this.memberCities[i]).xCordinate,this.getCityByName(this.memberCities[i]).yCordinate);
                x1 = this.getCityByName(this.memberCities[i]).xCordinate;
                y1 = this.getCityByName(this.memberCities[i]).yCordinate;
                if(i==this.memberCities.length-1){
                    this.drawLineBetweenTwoPoints(canvas,x1,y1,this.getCityByName(this.memberCities[0]).xCordinate,this.getCityByName(this.memberCities[0]).yCordinate);
                }
            }
        }, 20);
        
    }

    drawLineBetweenTwoPoints(canvas,x1,y1,x2,y2){
        const line = canvas.makeLine(x1,y1,x2,y2);
        canvas.update();
    }

    applyCrossOverAndMutate(memb){
        const crossoverLength = Math.floor(this.memberCities.length * crossOver);
        for(let i=0; i< crossoverLength; i++){
            let ind = this.memberCities.indexOf(memb[i]);
            this.memberCities[ind]=this.memberCities[i];
            this.memberCities[i] = memb[i];
        }
        for (index in this.memberCities) {
            if (mutationRate > Math.random()) {
                var randomIndex = Math.floor(Math.random() * this.memberCities.length);
                var tempNode = this.memberCities[randomIndex];
                this.memberCities[randomIndex] = this.memberCities[index];
                this.memberCities[index] = tempNode;
            }
        }
    }
}

function generatePopulation(){
    let member;
    for(let i=0;i<populationSize;i++){
        member = new Member(Shuffle(initialCitiesOrder.slice()),Infinity);
        population.push(member);
    }
}

function Shuffle(arr){
    for(let i=0;i<20;i++){   
        const i1 = Math.floor(Math.random() * arr.length);
        const i2 = Math.floor(Math.random() * arr.length);
        const temp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = temp;
    }
    return arr;
}

function calculateDistancesForAllPaths(){
    population.forEach(element => {
        element.calculatePathDistance(two);
    });
}

function figureOutBestFit(){
    population.forEach((ele,ind) => {
        if(ele.pathDistance < bestFitness){
            bestMember = ele;
            bestFitness = ele.pathDistance;
            bestIndex = ind;
            ele.drawPathJoiningAllCities(twoForBest);
            document.getElementById('statusLabel').innerHTML  += 'Best Fitness : ' + bestFitness + '<br>';
        }
    });
}

function crossOverAndMutation(){
    population.forEach(element => {
        if(element != bestMember){
        element.applyCrossOverAndMutate(bestMember.memberCities.slice());
        }
    });
}