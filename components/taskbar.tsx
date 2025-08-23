import React from "react";
import Link from "next/link";
import styles from "./taskbar.module.css";

const Taskbar: React.FC = () => {
  return (
    <nav className={styles.taskbar}>
      <ul>
        <li>
          <Link href="/">
            <span className={styles.home}>
              <img
                src="/assets/icons/home-2-svgrepo-com.svg"
                alt="Home"
                width={32}
                height={32}
              />
            </span>
          </Link>
        </li>
        <li>
          <Link href="/map">
            <span>
              <img
                src="/assets/icons/earth-9-svgrepo-com.svg"
                alt="Map"
                width={32}
                height={32}
              />
              マップ
            </span>
          </Link>
        </li>
        <li>
          <Link href="/post">
            <span>投稿</span>
          </Link>
        </li>
        <li>
          <Link href="/profile">
            <span>プロフィール</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Taskbar;
