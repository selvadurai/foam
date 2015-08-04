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

// TODO(kgr): remove use of SimpleValue, just use data$ binding instead.
CLASS({
  package: 'foam.ui.md',
  name: 'DAOListView',

  requires: ['SimpleValue'],

  extendsModel: 'foam.ui.DAOListView',

  properties: [
    {
      name: 'orientation',
      view: { factory_: 'foam.ui.ChoiceView', choices: ['vertical', 'horizontal'] },
      defaultValue: 'vertical',
    },
    {
      name: 'rowCache_',
      factory: function() { return {}; },
    },
    {
      name: 'data',
      postSet: function(old,nu) {
        if ( old ) {
          old.unlisten(this);
          this.daoRemovalCheck();
        }
        if ( nu ) {
          this.count_ = 0;
          nu.pipe(this);
        }
      }
    },
    {
      name: 'count_',
      hidden: true,
      documentation: 'Internal tracker of insertion order',
      defaultValue: 0,
    },
    {
      name: 'removalCheck_',
      model_: 'BooleanProperty',
      documentation: 'Internal tracker of removal check sweep.',
      defaultValue: false,
    },
  ],

  methods: {
    put: function(o) {
      /* Sink function to receive updates from the dao */
      if ( this.rowCache_[o.id] ) {
        //console.log("put cached", o.id);
        var d = this.rowCache_[o.id];
        if ( ! equals(d.view.data, o) ) d.view.data = o;
        if ( d.ordering < 0 ) d.ordering = this.count_++; // reset on removal check
      } else {
        //console.log("put new", o.id);

        if ( this.mode === 'read-write' ) o = o.model_.create(o, this.Y); //.clone();
        var view = this.rowView({data: o, model: o.model_}, this.Y);
        // TODO: Something isn't working with the Context, fix
        view.DAO = this.dao;
        if ( this.mode === 'read-write' ) {
          o.addPropertyListener(null, function(o, topic) {
            var prop = o.model_.getProperty(topic[1]);
            // TODO(kgr): remove the deepClone when the DAO does this itself.
            if ( ! prop.transient ) {
              // TODO: if o.id changed, remove the old one?
              view.DAO.put(o.deepClone());
            }
          });
        }
        this.addChild(view);
        this.rowCache_[o.id] = { view: view, ordering: this.count_++ };
        //this.onDAOUpdate();
      }
    },

    remove: function(o) {
      /* Sink function to receive updates from the dao */
      if ( this.rowCache_[o.id] ) {
        //console.log("remove", o.id);
        var v = this.rowCache_[o.id].view;
        v.destroy();
        if ( v.$ ) v.$.outerHTML = "";
        this.removeChild(v);
        delete this.rowCache_[o.id];
        //this.onDAOUpdate();
      }
    },

    eof: function() {
      /* Sink function to receive updates from the dao */
      this.count_ = 0;

      // removal check completion...
      // remove items that were not added back in
      if ( this.removalCheck_ ) {
        this.removalCheck_ = false;
        for (var key in this.rowCache_) {
          if ( this.rowCache_[key].ordering == -1 ) {
            this.remove({ id: key });
          }
        }
      }

      this.daoChange();
    },

    daoChange: function() {
      if ( ! this.dao || ! this.$ ) return;
      // build missing views for new items
      var outHTMLs = []; // string contents and existing nodes
      var toInit = []; // newly html'd views to init
      var debugCount = 0;
      for (var key in this.rowCache_) {
        var d = this.rowCache_[key];

        if ( d.view.$ ) {
          outHTMLs[d.ordering] = d.view.$;
        } else {
          outHTMLs[d.ordering] = d.view.toHTML();
          toInit.push(d);
          this.addChild(d.view);
          debugCount++;
//           if (debugCount > 2) {
//             this.X.setTimeout(this.realDAOUpdate, 16);
//             break;
//           }
        }
      }

      // create nodes for the strings, and insert between the existing nodes
      var firstTextItem = -1;
      for (var i = 0; i < outHTMLs.length; ++i) {
        // if text, remember the first one in the range.
        if ( outHTMLs[i] ) {
          if ( ! outHTMLs[i].nodeType ) { // outHTMLs[i] is string
            if ( firstTextItem < 0 ) {
              firstTextItem = i;
            }
          } else if ( firstTextItem >= 0 ) { // outHTMLs[i] is node
            // it's a node, so process and insert accumulated text before it
            // range [ firstTextItem , i-1 ]
            var node = outHTMLs[i];
            var html = "";
            for (var j = firstTextItem; j < i; ++j) {
              if ( outHTMLs[j] ) {
                html += outHTMLs[j];
              }
            }
            var el = this.X.document.createElement('div');
            node.parentNode.insertBefore(el, node);
            el.outerHTML = html;
            firstTextItem = -1;
          }
        }
      }

      if ( firstTextItem >= 0 ) {
        // no node found, so initialize
        var html = "";
        for (var j = firstTextItem; j < outHTMLs.length; ++j) {
          if ( outHTMLs[j] ) {
            html += outHTMLs[j];
          }
        }
        var el = this.X.document.createElement('div');
        this.$.appendChild(el);
        el.outerHTML = html;
        firstTextItem = -1;
      }

      // init the newly inserted views
      for (var i = 0; i < toInit.length; ++i) {
        toInit[i].view.initHTML();
        toInit[i].view.$.style.position = 'absolute';
      }

      this.onPositionUpdate();
      //this.X.setTimeout(this.onPositionUpdate, 1000);
      //console.log("daoChange added", debugCount, " of ", this.children.length);
    },

    construct: function() {
      if ( ! this.dao || ! this.$ ) return;

      if ( this.$ ) {
        this.$.style.position = 'relative';
        if ( this.orientation == 'vertical' ) {
          this.$.style.overflowY = 'scroll';
        } else {
          this.$.style.overflowX = 'scroll';
        }
      }

      this.count_ = 0;
      //this.data.pipe(this); // TODO: maybe not?
    },

    updatePositions: function() {

      var rows = [];
      for (var key in this.rowCache_) {
        var d = this.rowCache_[key];
        rows[d.ordering] = d;
      }
      //console.log("updatePositions", rows.length);

      var pos = 0;
      for (var i = 0; i < rows.length; ++i) {
        if ( rows[i] && rows[i].view.$ ) {

          if ( rows[i].offset !== pos ) {
            rows[i].offset = pos;
            //rows[i].view.$.style.position = 'absolute';
            if (  this.orientation == 'vertical' ) {
              rows[i].view.$.style.transform = "translate3d(0px, "+rows[i].offset+"px, 0px)";
              //rows[i].view.$.style.top = rows[i].offset+"px";
              //rows[i].view.$.style.left = "0px";
            } else {
              rows[i].view.$.style.transform = "translate3d("+rows[i].offset+"px, 0px, 0px)";
              //rows[i].view.$.style.left = rows[i].offset+"px";
              //rows[i].view.$.style.top = "0px";
            }
            //console.log("Position", rows[i].view.id, rows[i].ordering, rows[i].offset);
          }
          // TODO(jacksonic): the size we cache here could change in the DOM, and we have no way of knowing
          if ( ! rows[i].size ) {
            var rect = rows[i].view.$.getBoundingClientRect();
            rows[i].size = ( this.orientation == 'vertical' ) ? rect.height : rect.width;
          }
          pos += rows[i].size;

        }
      }
    },

    daoRemovalCheck: function() {
      // reset ordering
      for (var key in this.rowCache_) {
        this.rowCache_[key].ordering = -1;
      }
      this.removalCheck_ = true;
      // have everything put back in
      this.data.select(this);
    },

    destroy: function(s) {
      this.SUPER(s);

      //this.data && this.data.unlisten(this); // TODO: maybe not?
      this.rowCache_ = {};
      this.$.innerHTML = "";
    }



  },

  listeners: [
    {
      name: 'onDAOUpdate',
      code: function() {
        this.realDAOUpdate();
      }
    },
    {
      name: 'onPositionUpdate',
      framed: true,
      code: function() {
        this.updatePositions();
      }
    },
    {
      name: 'realDAOUpdate',
      isFramed: true,
      code: function() {
        if ( ! this.isHidden ) {
          this.daoChange();
          this.daoRemovalCheck();
        }
      }
    },
  ]
});