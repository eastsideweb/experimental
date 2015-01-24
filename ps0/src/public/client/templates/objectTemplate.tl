<div>
  <div id="rootItem" objId="{item._id}">
    <b>name: </b>{item.name}
    <div>
      <b>description: </b>{item.description}
    </div>
    <div>
      <div>
      {?item.active} <b>active :</b> {item.active} {/item.active}
      </div>
      <div>
      {?item.instructorIds} 
      <a id ="{item.instructorIds}" href="#series={item.seriesId}:type,{type}|id,{item._id}|subtype,InstructorIds">
        <b>List of instructors:</b>
      </a>
      {/item.instructorIds}
      </div>
      <div>
        {?item.playerIds}  <a id="{item.playerIds}" href="#series={seriesId}:type,{type}|id,{item._id}|subtype,playerIds">
      <b>List of players :</b>
    </a> {/item.playerIds}
    </div>
      <div>
        {?item.puzzleIds} <a id="{item.puzzleIds}" href="#series={seriesId}:type,{type}|id,{item._id}|subtype,puzzleIds">
        <b>List of puzzles</b>{/item.puzzleIds}
      </a>
      </div>
      <div>
        {?item.teamIds}<a id="{item.teamIds}" href="#series={seriesId}:type,{type}|id,{item._id}|subtype,teamIds">
        <b>List of teams</b> {/item.teamIds}
      </a>
      </div>
      <div>
        {?item.status} <b>Status :</b> {item.status}{/item.status}
      </div>
      <div>
        {?item.teamLeadId} <b>Team lead Id: </b> {item.teamLeadId} {/item.teamLeadId}
      </div>
    </div>
  </div>
  <button id="objeditButton" class="submit button-small" type="button">Edit</button>
  <button id="objdeleteButton" class="submit button-small" type="button">Delete</button>  
</div>