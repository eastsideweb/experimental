<div>
  <ul id="objaddsublist">
    {#items}
    <li class="selectableItems currentsublistItems" id="{_id}">
      <div><b>{name}</b>
        <div>{description}</div>
      </div>
    </li>{~n}
    {/items}
  </ul>
</div>