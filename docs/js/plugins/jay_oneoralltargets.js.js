//=============================================================================
// Single/Multiple targeting switch
// Jay_OneOrAllTargets.js
// Version 0.6
//=============================================================================

var Imported = Imported || {};
Imported.Jay_OneOrAllTargets = true;

var Jay = Jay || {};
Jay.OneOrAllTargets = Jay.OneOrAllTargets || {};

//=============================================================================
 /*:
 * @plugindesc Allows tagged skills to affect either one or all targets.
 *
 * @author Jason R. Godding
 * 
 * @param Set Enemy to All Key
 * @desc Which key to press to set targeting from one enemy to all.
 * You can define more than one key, separated by spaces.
 * @default shift
 * 
 * @param Set Enemy to One Key
 * @desc Which key to press to set targeting from all enemies to one.
 * You can define more than one key, separated by spaces.
 * @default shift
 * 
 * @param Set Ally to All Key
 * @desc Which key to press to set targeting from one ally to all.
 * You can define more than one key, separated by spaces.
 * @default shift
 * 
 * @param Set Ally to One Key
 * @desc Which key to press to set targeting from all allies to one.
 * You can define more than one key, separated by spaces.
 * @default shift
 *
 * @help To set a skill/item to be able to hit one or all targets, put the tag
 * <OneOrAll> in its Note box. It will default to targeting however it is set
 * in the database, but you can switch it by pressing the correct key. It is,
 * however, recommended that you use "1 enemy" or "1 ally" targeting in the
 * database.
 *
 * This plugin currently requires Yanfly's Battle Core to work at all. It is
 * recommended that you use Visual Enemy Select; it works without, but not
 * perfectly. In this build, all Target Core tags override the <OneOrAll>
 * tag (except <Repeat: x>), but the two plugins otherwise do not conflict.
 *
 * For damage/healing skills, you can use the tag <SplitMulti> to divide the
 * damage by the number of targets or <DivideMulti: x> to always divide the
 * damage for multiple targets by x. These can be placed on any skill, not just
 * ones  marked <OneOrAll>! (Though they won't DO anything for skills that only
 * hit a single target.) Using both tags on a single skill is allowed but not
 * recommended (it will split the damage twice.)
 *
 * This plugin is free for non-commercial and commercial use, but please credit 
 * Jason R. Godding if you use it. Thank you.
 * 
 */

Jay.Parameters = Jay.Parameters || {};
Jay.Parameters.OneOrAllTargets = PluginManager.parameters('Jay_OneOrAllTargets');

Jay.Param = Jay.Param || {};
Jay.Param.EnemyToAllKey = Jay.Parameters.OneOrAllTargets['Set Enemy to All Key'].split(' ');
Jay.Param.EnemyToOneKey = Jay.Parameters.OneOrAllTargets['Set Enemy to One Key'].split(' ');
Jay.Param.AllyToAllKey = Jay.Parameters.OneOrAllTargets['Set Ally to All Key'].split(' ');
Jay.Param.AllyToOneKey = Jay.Parameters.OneOrAllTargets['Set Ally to One Key'].split(' ');

Jay.OneOrAllTargets.actionInit = Game_Action.prototype.initialize;
Game_Action.prototype.initialize = function(subject, forcing) {
	this._switchToOne = false;
	this._switchToAll = false;
	Jay.OneOrAllTargets.actionInit.call(this, subject, forcing);
};


Jay.OneOrAllTargets.isForOne = Game_Action.prototype.isForOne;
Game_Action.prototype.isForOne = function() {
	if (this._switchToOne) {
		return true;
	}
	else if (this._switchToAll) {
		return false;
	}
	return Jay.OneOrAllTargets.isForOne.call(this);
};

Jay.OneOrAllTargets.isForAll = Game_Action.prototype.isForAll;
Game_Action.prototype.isForAll = function() {
	if (this._switchToAll) {
		return true;
	}
	else if (this._switchToOne) {
		return false;
	}
	return Jay.OneOrAllTargets.isForAll.call(this);
};

Game_Action.prototype.allowsOneOrAll = function() {
	if (this.item() && this.item().meta.OneOrAll) {
		return true;
	}
	return false;
};

Game_Action.prototype.switchToAll = function() {
	if (this.allowsOneOrAll()) {
		this._switchToOne = false;
		this._switchToAll = true;
	}
};

Game_Action.prototype.switchToOne = function() {
	if (this.allowsOneOrAll()) {
		this._switchToOne = true;
		this._switchToAll = false;
	}
};

Jay.OneOrAllTargets.makeDamageValue = Game_Action.prototype.makeDamageValue;
Game_Action.prototype.makeDamageValue = function(target, critical) {
	var baseDamage = Jay.OneOrAllTargets.makeDamageValue.call(this, target, critical);
	var numTargets = this.makeTargets().length;
	if(this.item().meta.SplitMulti && numTargets > 0) {
		baseDamage = baseDamage / numTargets;
	}
	if(this.item().meta.DivideMulti && numTargets > 1) {
		baseDamage = baseDamage / this.item().meta.DivideMulti;
	}
	baseDamage = Math.round(baseDamage);
	return baseDamage;
}

Jay.OneOrAllTargets.updateScene = Scene_Battle.prototype.update
Scene_Battle.prototype.update = function() {
	Jay.OneOrAllTargets.updateScene.call(this);
	this.updateOneOrAll();
};

Scene_Battle.prototype.updateOneOrAll = function() {
	var input = BattleManager.inputtingAction();
	var triggered = function(key) {
                return Input.isTriggered(key);
            };

	if (!this._actorWindow.active && !this._enemyWindow.active) {
		return;
	}

	if (!input) {
		return;
	}

	if (!input.item()) {
		return;
	}

	if(!input.allowsOneOrAll()) {
		return;
	}

	if (Jay.Param.EnemyToAllKey.some(triggered) && input.isForOne() && this._enemyWindow.active) {
		input.switchToAll();
		BattleManager.startAllSelection();
		this._helpWindow.clear();
		this._helpWindow.drawSpecialSelectionText(input);
	}
	else if (Jay.Param.EnemyToOneKey.some(triggered) && input.isForAll() && this._enemyWindow.active) {
		input.switchToOne();
		BattleManager.stopAllSelection();
		this._helpWindow.clear();
		this._helpWindow.setBattler(this._enemyWindow.enemy());
	}
	else if (Jay.Param.AllyToAllKey.some(triggered) && input.isForOne() && this._actorWindow.active) {
		input.switchToAll();
		BattleManager.startAllSelection();
		this._helpWindow.clear();
		this._helpWindow.drawSpecialSelectionText(input);
	}
	else if (Jay.Param.AllyToOneKey.some(triggered) && input.isForAll() && this._actorWindow.active) {
		input.switchToOne();
		BattleManager.stopAllSelection();
		this._helpWindow.clear();
		this._helpWindow.setBattler(this._actorWindow.actor());
	}
};

Jay.OneOrAllTargets.specialSelectionText = Window_Help.prototype.specialSelectionText;
Window_Help.prototype.specialSelectionText = function(action) {
	if (action && action.isForAll()) {
		return true;
	}
	return Jay.OneOrAllTargets.specialSelectionText.call(this, action);
};