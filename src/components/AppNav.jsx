import { NavLink } from "react-router-dom";
import styles from "./AppNav.module.css";

function AppNav() {
  return (
    <nav className={styles.nav}>
      <ul>
        {/**TODO: PASS IN NAVLINK TO BE ABLE TO NAVIGATE BETWEEN THE "cities" AND "countries" ROUTES */}
      </ul>
    </nav>
  );
}

export default AppNav;
