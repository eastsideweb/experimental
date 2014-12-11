<div class="modal">
  <a href="#" class="btn_close">
    <img src="client\img\close.png" title="Close Window" alt="Close" />
  </a>
  <form id="loginForm">
    <fieldset>
      <legend>Enter Details</legend>
      <table>
        <tr>
          <td>
            <label class="loginText">Username</label>
            <input id="username" name="username" value="" type="text" autocomplete="on" placeholder="UserName" />
          </td>
        </tr>
        <tr>
          <td>
            <label class="loginText">Role Type</label><br/>
            <input id="roleType" name="roleType" value="administrator" type="radio" checked/> administrator
            <br/>
            <input id="roleType" name="roleType" value="instructor" type="radio" /> instructor
            <br/>
            <input id="roleType" name="roleType" value="player" type="radio" /> player
          </td>
        </tr>
        <tr>
          <td>
            <label class="loginText">Password</label>
            <input id="password" name="password" value="" type="password" placeholder="Password" />
          </td>
        </tr>
        <tr>
          <td>
            <button class="submit button" type="button">Sign in</button>
          </td>
        </tr>
      </table>
    </fieldset>
  </form>
  <div id="error"></div>
</div>