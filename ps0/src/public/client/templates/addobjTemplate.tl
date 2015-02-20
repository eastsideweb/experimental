<div>
  <form id ="addForm">
    {@eq key="events" value=objType} <legend>Found events </legend>
    {:else}<legend> Not Found</legend>
    {/eq}
    <legend>Enter Details for {objType} </legend>
    <table>
      <tr>
        <td>
          <label class="objDetails">Name</label>
          <input id="name" name="name" value="" type="text" autocomplete="on" placeholder="name" />
        </td>
      </tr>
      <tr>
        <td>
          <label class="objDetails">Description</label>
          <input id="description" name="description" value="" type="text" autocomplete="on" placeholder="description" />
        </td>
      </tr>
      <tr>
        <td>
          <label class="objDetails">Active</label><br/>
          <input id="active" name="active" value="true" type="radio" checked="" />True
          <br/>
          <input id="active" name="active" value="false" type="radio" />False
        </td>
      </tr>
      {@eq key="events" value=objType}
      <tr>
        <td>
          <label class="objDetails">Status</label><br/>>
          <input id="status" name="status" value="started" type="radio" checked="" />started
          <br/>
          <input id="status" name="status" value="notStarted" type="radio"/> notStarted
        </td>
      </tr>
      {/eq}
      <tr>
        <td>
          <button id="saveButton" class="submit button-small" type="button">Save</button>
        </td>
      </tr>
    </table>
  </form>
</div>