/*:
 * @plugindesc Making AIrship unable to land on region 196
 * @author Playerian
 *
 * @help
 * ============================================================================
 * Making AIrship unable to land on region 196
 * =============================================================================
 * 

 */
 
(function() {
	
	//get parameters
	var parameters = PluginManager.parameters('AirshipLand');
	var Playerian = {} || Playerian;

	//air ship landing
	Playerian.Game_Map_isAirshipLandOk = Game_Map.prototype.isAirshipLandOk;
	Game_Map.prototype.isAirshipLandOk = function(x, y) {
    	if (this.regionId(x, y) === 196){
			return false;
		};
		return this.checkPassage(x, y, 0x0800) && this.checkPassage(x, y, 0x0f);
	};
	Game_Player.prototype.getOnVehicle = function() {
		var direction = this.direction();
		var x1 = this.x;
		var y1 = this.y;
		var x2 = $gameMap.roundXWithDirection(x1, direction);
		var y2 = $gameMap.roundYWithDirection(y1, direction);
		if ($gameSwitches){
			if ($gameSwitches.value(35)){
				return false;
			}
		}
		if ($gameMap.airship().pos(x1, y1)) {
			this._vehicleType = 'airship';
		} else if ($gameMap.ship().pos(x2, y2)) {
			this._vehicleType = 'ship';
		} else if ($gameMap.boat().pos(x2, y2)) {
			this._vehicleType = 'boat';
		}
		if (this.isInVehicle()) {
			this._vehicleGettingOn = true;
			if (!this.isInAirship()) {
				this.forceMoveForward();
			}
			this.gatherFollowers();
		}
		return this._vehicleGettingOn;
	};
	//horse
	/*
	Game_Map.prototype.createVehicles = function() {
		this._vehicles = [];
		this._vehicles[0] = new Game_Vehicle('boat');
		this._vehicles[1] = new Game_Vehicle('ship');
		this._vehicles[2] = new Game_Vehicle('airship');
		this._vehicles[3] = new Game_Vehicle('horse');
	};
	Game_Vehicle.prototype.initMoveSpeed = function() {
		if (this.isBoat()) {
			this.setMoveSpeed(4);
		} else if (this.isShip()) {
			this.setMoveSpeed(5);
		} else if (this.isAirship()) {
			this.setMoveSpeed(6);
		} else {
			this.setMoveSpeed(5);
		}
	};
	Game_Vehicle.prototype.vehicle = function() {
		if (this.isBoat()) {
			return $dataSystem.boat;
		} else if (this.isShip()) {
			return $dataSystem.ship;
		} else if (this.isAirship()) {
			return $dataSystem.airship;
		} else {
			return $dataSystem.horse;
		}
	};*/
	Playerian.Game_Map_isPassable = Game_Map.prototype.isPassable;
	Game_Map.prototype.isPassable = function(x, y, d) {
		if ($gameSwitches){
			if ($gameSwitches.value(35)){
				if (this.regionId(x, y) === 196){
					return false;
				};
			}
			if ($gameSwitches.value(72)){
				if (this.regionId(x, y) === 3){
					return true;
				}else{
					return false;
				}
			}
		}
		return this.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f);
	};
})();
  