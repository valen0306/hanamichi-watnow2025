import React from "react";
import Link from "next/link";
import styles from "./taskbar.module.css";

const Taskbar: React.FC = () => {
  return (
    <nav className={styles.taskbar}>
      <ul>
        <li>
          <Link href="/">
            <span>ホーム</span>
          </Link>
        </li>
        <li>
          <Link href="/map">
            <span>マップ</span>
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
