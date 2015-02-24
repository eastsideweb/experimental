<div>
  <ul id="objsublist">
    {#items}
    <li class="selectableItems currentsublistItems" id="{_id}">
      <div><b>{name}</b>
        <div>{description}</div>
      </div>
    </li>{~n}
    {/items}
  </ul>
  <div id="sublist-remove-dialog-confirm" title="Remove all selected Items?">
    <p class="mediumtext">
      <span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span> Remove! Are you sure you want to remove the selected items?
    </p>
  </div>
  <div id="sublist-add-dialog" title="Add items" >
    <div id="sublist-add-items-container"/>
  </div>
  
  <button id="addSublistButton" class="submit button-small" type="button">Add</button>
  <button id="deleteSublistButton" class="submit button-small" type="button">Remove</button>
</div>