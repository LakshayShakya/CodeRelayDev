import React, { useState } from 'react';

interface Project {
  id: number;
  name: string;
  description: string;
  date: string;
}

interface DashboardStyles {
  [key: string]: React.CSSProperties;
}

const Dashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState<string>('HOME');

  const navItems: string[] = ['HOME', 'MY REPO', 'NOTIFICATIONS'];

  const projects: Project[] = [
    {
      id: 1,
      name: 'Project One',
      description: 'Description for project one goes here.',
      date: 'Mar 15, 2024'
    },
    {
      id: 2,
      name: 'Project Two',
      description: 'Description for project two goes here.',
      date: 'Mar 18, 2024'
    },
    {
      id: 3,
      name: 'Project Three',
      description: 'Description for project three goes here.',
      date: 'Mar 12, 2024'
    },
    {
      id: 4,
      name: 'Project Four',
      description: 'Description for project four goes here.',
      date: 'Mar 20, 2024'
    },
    {
      id: 5,
      name: 'Project Five',
      description: 'Description for project five goes here.',
      date: 'Mar 25, 2024'
    },
    {
      id: 6,
      name: 'Project Six',
      description: 'Description for project six goes here.',
      date: 'Mar 22, 2024'
    }
  ];

  const styles: DashboardStyles = {
    body: {
      margin: 0,
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    },
    header: {
      backgroundColor: '#dc143c',
      color: 'white',
      padding: '18px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    headerTitle: {
      fontSize: '22px',
      fontWeight: '600',
      margin: 0,
      letterSpacing: '1px'
    } as React.CSSProperties,
    headerNav: {
      display: 'flex',
      gap: '40px',
      alignItems: 'center'
    },
    headerLink: {
      color: 'white',
      textDecoration: 'none',
      fontSize: '13px',
      cursor: 'pointer',
      fontWeight: '500',
      letterSpacing: '0.5px'
    },
    profileIcon: {
      width: '35px',
      height: '35px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '50%',
      border: '2px solid white'
    },
    container: {
      display: 'flex',
      minHeight: 'calc(100vh - 65px)'
    },
    aside: {
      width: '260px',
      backgroundColor: 'white',
      borderRight: '2px solid #e9ecef',
      padding: '25px 0',
      boxShadow: '1px 0 3px rgba(0, 0, 0, 0.05)'
    },
    navLink: {
      display: 'block',
      padding: '16px 22px',
      color: '#495057',
      textDecoration: 'none',
      fontSize: '13px',
      borderLeft: '4px solid transparent',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      fontWeight: '500',
      letterSpacing: '0.3px',
      transition: 'all 0.2s ease'
    },
    navLinkActive: {
      backgroundColor: '#fff5f5',
      borderLeftColor: '#dc143c',
      color: '#dc143c',
      fontWeight: '600'
    },
    main: {
      flex: 1,
      padding: '35px 40px',
      backgroundColor: '#f8f9fa',
      overflowY: 'auto'
    },
    mainHeader: {
      marginBottom: '35px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e9ecef'
    },
    mainTitle: {
      fontSize: '28px',
      color: '#212529',
      margin: '0 0 8px 0',
      fontWeight: '600'
    } as React.CSSProperties,
    mainSubtitle: {
      fontSize: '13px',
      color: '#6c757d',
      margin: 0
    },
    projectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px'
    },
    projectCard: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '28px',
      border: '1px solid #dee2e6',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      overflow: 'hidden'
    },
    projectCardBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      backgroundColor: '#dc143c'
    },
    projectTitle: {
      fontSize: '17px',
      color: '#212529',
      marginBottom: '15px',
      margin: '0 0 15px 0',
      fontWeight: '600'
    } as React.CSSProperties,
    projectDescription: {
      color: '#6c757d',
      fontSize: '13px',
      lineHeight: '1.6',
      marginBottom: '18px'
    },
    projectFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '12px',
      color: '#adb5bd',
      paddingTop: '16px',
      borderTop: '1px solid #e9ecef'
    },
    projectStatus: {
      display: 'inline-block',
      padding: '4px 10px',
      backgroundColor: '#fff5f5',
      color: '#dc143c',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.3px'
    }
  };

  return (
    <div style={styles.body}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>DASHBOARD</h1>
        <div style={styles.headerNav}>
          <a style={styles.headerLink}>PEOPLE</a>
          <a style={styles.headerLink}>SETTINGS</a>
          <div style={styles.profileIcon}></div>
        </div>
      </header>

      <div style={styles.container}>


        <aside style={styles.aside}>
          <nav>
            {navItems.map((item: string) => (
              <a
                key={item}
                onClick={() => setActiveNav(item)}
                style={{
                  ...styles.navLink,
                  ...(activeNav === item ? styles.navLinkActive : {})
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        </aside>

        <main style={styles.main}>
          <div style={styles.mainHeader}>
            <h2 style={styles.mainTitle}>Projects</h2>
            <p style={styles.mainSubtitle}>Manage and track all your active projects</p>
          </div>

          <div style={styles.projectsGrid}>
            {projects.map((project: Project) => (
              <div key={project.id} style={styles.projectCard}>
                <div style={styles.projectCardBorder}></div>
                <h3 style={styles.projectTitle}>{project.name}</h3>
                <p style={styles.projectDescription}>{project.description}</p>
                <div style={styles.projectFooter}>
                  <span style={styles.projectStatus}>Active</span>
                  <span>{project.date}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;