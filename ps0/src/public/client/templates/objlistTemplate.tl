<div>
  <ul id="objlist">
    {#items}
    <li class="selectableItems">
      <div id="{_id}">
          <b>{name}</b>
        <div>{description}</div>
      </div>
    </li>{~n}
    {/items}
  </ul>
  <button id="editButton" class="submit button-small" type="button">Edit</button>
  <button id="deleteButton" class="submit button-small" type="button">Delete</button>
  <button id="activateButton" class="submit button-small" type="button">Activate</button>
  <button id="deactivateButton" class="submit button-small" type="button">Deactivate</button>  
  <button id="addButton" class="submit button-small" type="button">Add</button>
</div>