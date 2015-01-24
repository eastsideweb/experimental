<div>
  <ul id="objlist">
    {#items}
    <li class="selectableItems">
      <div>
        <a id="{_id}" href="#series={seriesId}:type,{objtype}|id,{_id}">
          <b>{name}</b>
        </a>
        <div>{description}</div>
      </div>
    </li>{~n}
    {/items}
  </ul>
  <button id="editButton" class="submit button-small" type="button">Edit</button>
  <button id="deleteButton" class="submit button-small" type="button">Delete</button> 
  <button id="addButton" class="submit button-small" type="button">Add</button>
</div>