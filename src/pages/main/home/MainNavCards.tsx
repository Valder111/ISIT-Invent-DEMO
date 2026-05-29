import { Link } from 'react-router-dom'

export function MainNavCards({ showWriteOffsCard }: { showWriteOffsCard: boolean }) {
  return (
    <section className="main-site-links">
      <div className="cards-grid">
        <Link className="cards-grid__card" to="/equipment">
          <h3 className="cards-grid__card-title">Просмотр оборудования</h3>
          <p className="cards-grid__card-desc">Категории, модели и экземпляры оборудования: иерархический каталог с поиском и фильтрами.</p>
        </Link>
        <Link className="cards-grid__card" to="/tickets">
          <h3 className="cards-grid__card-title">Заявки</h3>
          <p className="cards-grid__card-desc">Создание черновика, формирование заявки, история и детали.</p>
        </Link>
        <Link className="cards-grid__card" to="/documents">
          <h3 className="cards-grid__card-title">Документы</h3>
          <p className="cards-grid__card-desc">Файлы платформы, поиск и переходы к связанным объектам.</p>
        </Link>
        {showWriteOffsCard && (
          <Link className="cards-grid__card" to="/writeoffs">
            <h3 className="cards-grid__card-title">Списание</h3>
            <p className="cards-grid__card-desc">Акты списания экземпляров и расходников.</p>
          </Link>
        )}
      </div>
    </section>
  )
}
