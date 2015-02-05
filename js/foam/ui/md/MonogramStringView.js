/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

CLASS({
  name: 'MonogramStringView',
  package: 'foam.ui.md',

  extendsModel: 'View',
  traits: ['foam.ui.md.ColoredBackgroundTrait'],

  properties: [
    { name: 'data',      postSet: function() { this.updateHTML(); } },
    { name: 'className', defaultValue: 'monogram-string-view' },
    { name: 'tooltip',   defaultValueFn: function() { return this.data; } }
  ],

  methods: {
    generateColor: function(data) {
      return data ? this.SUPER(data) : 'url(images/silhouette.png)';
    },
    updateHTML: function() {
      if ( this.$ ) this.$.style.background = this.generateColor(this.data);
      return this.SUPER();
    },
  },

  templates: [
    function CSS() {/*
      .monogram-string-view {
        -webkit-align-items: center;
        -webkit-flex-grow: 0;
        -webkit-justify-content: center;
        align-items: center;
        border-radius: 20px;
        border: 1px solid rgba(0,0,0,.1);
        color: #fff;
        display: -webkit-inline-flex;
        display: inline-flex;
        flex-grow: 0;
        font-size: 20px;
        height: 40px;
        justify-content: center;
        margin-right: 16px;
        overflow: hidden;
        padding-bottom: 2px;
        width: 40px;
      }
    */},
    function toInnerHTML() {/* {{{this.data[0] && this.data[0].toUpperCase() || '&nbsp;' }}} */},
    function toHTML() {/*
      <div id="<%= this.id %>" <%= this.cssClassAttr() %> style="background: <%= this.generateColor(this.data) %>">
        <%= this.toInnerHTML() %>
      </div>
    */}
  ]

});
