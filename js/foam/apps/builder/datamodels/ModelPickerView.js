/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

CLASS({
  package: 'foam.apps.builder.datamodels',
  name: 'ModelPickerView',
  extendsModel: 'foam.ui.DetailView',

  requires: [
    'foam.browser.ui.BrowserView',
    'foam.browser.BrowserConfig',
    'foam.meta.types.ModelEditView',
    'foam.dao.IDBDAO',
    'Model',
    'foam.apps.builder.datamodels.ModelCitationView',
    'foam.ui.md.UpdateDetailView',
    'foam.ui.md.PopupChoiceView',
  ],

  imports: [
    'stack',
    'modelDAO',
  ],

  exports: [
    ' as dao',
  ],

  methods: [
    function put(o, sink) {
      /* Receive update from our UpdateDetailView */
      this.data = o.deepClone();
      this.data.instance_.prototype_ = undefined; // reset prototype so changes will be rebuilt
      sink && sink.put(this.data);

      // also save to DataModels store. TODO(jacksonic): load changes to model when stored copy changes? (listen to modelDAO?)
      this.modelDAO && this.modelDAO.put(this.data);
    },
  ],

  properties: [
    {
      model_: 'ModelProperty',
      name: 'baseModel',
      help: 'The list is filtered to only include models that extend baseModel.',
      postSet: function() {
        this.model_.MODEL_DAO.onDAOUpdate.call(this);
      }
    },
    {
      name: 'modelLabel',
      defaultValueFn: function() { return this.baseModel.label; }
    },
    {
      name: 'data',
      postSet: function() {
        if ( this.modelName !== this.data.id ) {
          this.modelName = this.data.id;
        }
      }
    },
    {
      name: 'modelName',
      postSet: function() {
        if ( this.modelName !== this.data.id ) {
          this.modelDAO.where(EQ(Model.ID, this.modelName)).select({
            put: function(m) {
              if ( m ) {
                this.data = m;
              }
            }.bind(this)
          });
        }
      }
    },
    {
      name: 'action',
      defaultValueFn: function() {
        return this.PICK;
      }
    },
    {
      name: 'className',
      defaultValue: 'md-model-picker-view',
    },
    {
      name: 'modelList',
      factory: function() { return []; }
    },
    {
      model_: 'foam.core.types.DAOProperty',
      name: 'modelDAO',
      onDAOUpdate: function() {
        if ( ! this.baseModel ) return;
        var modelList = [];
        this.modelDAO.where(EQ(Model.EXTENDS_MODEL, this.baseModel.id)).select({
          put: function(m) {
            modelList.push([m.id, m.id]);
          }.bind(this),
          eof: function() {
            // no results? Our data must be a new model, not saved yet.
            if ( ! modelList.length ) {
              this.modelList.push([this.data.id, this.data.id]);
            } else {
              this.modelList = modelList;
            }
          }.bind(this)
        });
        this.modelName = this.modelName;
      }
    }
  ],

  actions: [
    {
      name: 'pick',
      label: 'Use Questions from another Questionnaire',
      width: 100,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAZ0lEQVR4AdXOrQ2AMBRF4bMc/zOUOSrYoYI5cQQwpAieQDW3qQBO7Xebxx8bWAk5/CASmRHzRHtB+d0Bkw0W5ZiT0SYbFcl6u/2eeJHbxIHOhWO6Er6/y9syXpMul5PLefAGKZ1/rwtTimwbWLpiCgAAAABJRU5ErkJggg==',
      action: function() {
        // we export ourself as the dao for the editor, so when it puts the result back
        // we react in our put() method.
        this.stack.pushView(this.UpdateDetailView.create({
          data$: this.data$,
          innerView: 'foam.meta.types.ModelEditView',
          liveEdit: true,
        }));
      }
    },
    {
      name: 'edit',
      label: 'Edit the Questions',
      width: 100,
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAZ0lEQVR4AdXOrQ2AMBRF4bMc/zOUOSrYoYI5cQQwpAieQDW3qQBO7Xebxx8bWAk5/CASmRHzRHtB+d0Bkw0W5ZiT0SYbFcl6u/2eeJHbxIHOhWO6Er6/y9syXpMul5PLefAGKZ1/rwtTimwbWLpiCgAAAABJRU5ErkJggg==',
      action: function() {
        // we export ourself as the dao for the editor, so when it puts the result back
        // we react in our put() method.
        this.stack.pushView(this.UpdateDetailView.create({
          data$: this.data$,
          innerView: 'foam.meta.types.ModelEditView',
          liveEdit: true,
        }));
      }
    }
  ],

  listeners: [
    {
      name: 'selectionChange',
      code: function(obj, topic, old, nu) {
        if (nu) {
          this.data = nu;
        }
      }
    }
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %>>
        <div class="md-model-picker-view-name">
          <div class="md-model-picker-view-edit md-style-trait-standard">
            $$modelLabel{ model_: 'foam.ui.md.TextFieldView', mode:'read-only', floatingLabel: false, inlineStyle: true }
          </div>
          $$modelName{ model_: 'foam.ui.md.PopupChoiceView', choices$: this.modelList$, width: 200 }
          $$edit{ model_: 'foam.ui.md.FlatButton' }
        </div>
      </div>
    */},
    function CSS() {/*
      .md-model-picker-view {
      }
      .md-model-picker-view-name {
        display: flex;
        align-items: baseline;
      }
      .md-model-picker-view-title {
        font-size: 120%;
        color: #999;
      }
      .md-model-picker-view-edit {
        flex-grow: 0;
        padding-right: 24px;
      }
    */},
  ],

});
