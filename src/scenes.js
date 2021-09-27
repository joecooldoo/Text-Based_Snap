/*

    scenes.js

    multi-scene support for Snap!

    written by Jens Mönig
    jens@moenig.org

    Copyright (C) 2021 by Jens Mönig

    This file is part of Snap!.

    Snap! is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


    prerequisites:
    --------------
    needs morphic.js and objects.js

    toc
    ---
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

    Project
    Scene

    credits
    -------
    scenes have been inspired by Ted Kaehlers's personal demos of HyperCard
    and many discussions with Ted about the design and practice of HyperCard,
    and by personal discussions with Wolfgang Slany about his design of
    scenes in Catrobat/PocketCode, which I love and admire.

*/

/*global modules, VariableFrame, ScrollFrameMorph, SpriteMorph, Process, List,
normalizeCanvas, SnapSerializer, Costume*/

/*jshint esversion: 6*/

// Global stuff ////////////////////////////////////////////////////////

modules.scenes = '2021-July-22';

// Projecct /////////////////////////////////////////////////////////

// I am a container for a set of one or more Snap! scenes,
// the IDE operates on an instance of me

// Project instance creation:

function Project(scenes, current) {
    var projectScene;

    this.scenes = scenes || new List();
    this.currentScene = current;

    // proxied for display
    this.name = null;
    this.notes = null;
    this.thumbnail = null;

    projectScene = this.scenes.at(1);
    if (projectScene) {
        this.name = projectScene.name;
        this.notes = projectScene.notes;
        this.thumbnail = normalizeCanvas(
            projectScene.stage.thumbnail(SnapSerializer.prototype.thumbnailSize)
        );
    }

    // for deserializing - do not persist
    this.sceneIdx = null;
}

Project.prototype.initialize = function () {
    // initialize after deserializing
    // only to be called by store
    this.currentScene = this.scenes.at(+this.sceneIdx || 1);
    return this;
};

Project.prototype.addDefaultScene = function () {
    var scene = new Scene();
    this.scenes.add(scene);
};

// Scene /////////////////////////////////////////////////////////

// I am a container for a Snap! stage, scene-global variables
// and its associated settings.
// I can be used as a slide in a presentation, a chapter in a narrative,
// a level in a game, etc.

// Scene instance creation:

function Scene(aScrollFrameMorph) {
    this.name = '';
    this.notes = '';
    this.globalVariables = aScrollFrameMorph ?
        aScrollFrameMorph.globalVariables() : new VariableFrame();
    this.stage = aScrollFrameMorph || new StageMorph(this.globalVariables);
    this.hasUnsavedEdits = false;
    this.unifiedPalette = true;

    // global settings (shared)
    this.hiddenPrimitives = {};
    this.codeMappings = {};
    this.codeHeaders = {};
    this.customCategories = new Map(); // key: name, value: color

    // global settings (copied)
    this.enableCodeMapping = false;
    this.enableSublistIDs = false;
    this.enableLiveCoding = false;
    this.enableHyperOps = true;

    // for deserializing - do not persist
    this.targetStage = null;
}

Scene.prototype.initialize = function () {
    // initialize after deserializing
    // only to be called by store
    this.currentSprite = this.stage;
    return this;
};

Scene.prototype.captureGlobalSettings = function () {
    this.hiddenPrimitives = StageMorph.prototype.hiddenPrimitives;
    this.codeMappings = StageMorph.prototype.codeMappings;
    this.codeHeaders = StageMorph.prototype.codeHeaders;
    this.enableCodeMapping = StageMorph.prototype.enableCodeMapping;
    this.enableSublistIDs = StageMorph.prototype.enableSublistIDs;
    this.enableLiveCoding = Process.prototype.enableLiveCoding;
    this.enableHyperOps = Process.prototype.enableHyperOps;
    this.customCategories = SpriteMorph.prototype.customCategories;
};

Scene.prototype.applyGlobalSettings = function () {
    Costume.prototype.maxDimensions = this.stage.dimensions;
    StageMorph.prototype.hiddenPrimitives = this.hiddenPrimitives;
    StageMorph.prototype.codeMappings = this.codeMappings;
    StageMorph.prototype.codeHeaders = this.codeHeaders;
    StageMorph.prototype.enableCodeMapping = this.enableCodeMapping;
    StageMorph.prototype.enableSublistIDs = this.enableSublistIDs;
    Process.prototype.enableLiveCoding = this.enableLiveCoding;
    Process.prototype.enableHyperOps = this.enableHyperOps;
    SpriteMorph.prototype.customCategories = this.customCategories;
};
