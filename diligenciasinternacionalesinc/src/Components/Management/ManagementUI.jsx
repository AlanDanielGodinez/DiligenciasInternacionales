import React from 'react';
import './ManagementUI.css';

const classes = (...values) => values.filter(Boolean).join(' ');

export const ManagementPage = ({ as: Tag = 'main', className, children, ...props }) => (
  <Tag className={classes('management-page', className)} {...props}>{children}</Tag>
);

export const ManagementHeader = ({ eyebrow, title, description, actions, className, children }) => (
  <header className={classes('management-header', className)}>
    {children || <>
      <div className="management-header__copy">
        {eyebrow && <span className="management-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="management-header__actions">{actions}</div>}
    </>}
  </header>
);

export const ManagementStats = ({ children, className, label = 'Resumen' }) => (
  <section className={classes('management-stats', className)} aria-label={label}>{children}</section>
);

export const ManagementStatCard = ({ label, value, caption, icon: Icon, tone = 'default', className }) => (
  <article className={classes('management-stat-card', `management-stat-card--${tone}`, className)}>
    {Icon && <span className="management-stat-card__icon"><Icon /></span>}
    <div><span>{label}</span><strong>{value}</strong>{caption && <small>{caption}</small>}</div>
  </article>
);

export const ManagementPanel = ({ as: Tag = 'section', className, children, ...props }) => (
  <Tag className={classes('management-panel', className)} {...props}>{children}</Tag>
);

export const ManagementToolbar = ({ as: Tag = 'div', className, children, ...props }) => (
  <Tag className={classes('management-toolbar', className)} {...props}>{children}</Tag>
);

export const ManagementTableFrame = ({ as: Tag = 'div', className, children, ...props }) => (
  <Tag className={classes('management-table-frame', className)} {...props}>{children}</Tag>
);

export const ManagementState = ({ children, tone = 'empty', className }) => (
  <div className={classes('management-state', `management-state--${tone}`, className)}>{children}</div>
);

export const ManagementBadge = ({ children, tone = 'default', className }) => (
  <span className={classes('management-badge', `management-badge--${tone}`, className)}>{children}</span>
);

export const ManagementActions = ({ className, children, ...props }) => (
  <div className={classes('management-actions', className)} {...props}>{children}</div>
);

export const ManagementActionButton = ({ className, children, ...props }) => (
  <button className={classes('management-action-button', className)} {...props}>{children}</button>
);

export const ManagementPagination = ({ page, totalPages, onPrevious, onNext, className }) => (
  <nav className={classes('management-pagination', className)} aria-label="Paginación">
    <button type="button" onClick={onPrevious} disabled={page <= 1}>Anterior</button>
    <span>Página {page} de {totalPages}</span>
    <button type="button" onClick={onNext} disabled={page >= totalPages}>Siguiente</button>
  </nav>
);
