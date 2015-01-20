<div>
  <div id="rootItem" objId="{item._id}">
    <b>name: </b>{item.name}
    <div>
      <b>description: </b>{item.description}
    </div>
    <div>
      <b>active</b>: {item.active}
    </div>
    {?item.playerIds}
    <a href="#series={seriesId}:type,{type}|id,{item._id}|subtype,players">List of players</a>
    {/item.playerIds}
  </div>
  <button id="objeditButton" class="submit button-small" type="button">Edit</button>
  <button id="objdeleteButton" class="submit button-small" type="button">Delete</button>
  <button id="objactivateButton" class="submit button-small" type="button">Activate</button>
  <button id="objdeactivateButton" class="submit button-small" type="button">Deactivate</button>  
</div>