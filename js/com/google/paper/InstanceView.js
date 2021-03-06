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
  package: 'com.google.paper',
  name: 'InstanceView',
  extends: 'foam.ui.md.DetailView',

  methods: [
    function shouldDestroy() { return true; },
  ],

  templates: [
    function toHTML() {/*
      <div id="%%id" <%= this.cssClassAttr() %> >
      <% if ( this.data && this.data.toHTML ) { console.log("toHTMLd", this.data.name_); %>
          <%= this.data %>
      <% } else if ( this.data && this.data.toE ) { console.log("toEd", this.data.name_); %>
          <%= this.data.toE(this.Y) %>
      <% } else if ( this.data ){ console.log("rendered", data.name_); %>
           $$data
      <% } %>
      </div>
    */},
    function CSS() {/*
    */},

  ],

});


