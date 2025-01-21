import { FaCreditCard } from "react-icons/fa";

const DownFooter = () => {
  return (
    <footer id="footer">
      <section
        className="copyrightbottom"
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px 0",
          borderTop: "1px solid #e9ecef",
        }}
      >
        <div className="container" style={{ paddingTop: "11px" }}>
          <div className="row">
            <div
              className="col-md-4 col-xs-12"
              style={{ textAlign: "center", marginBottom: "15px" }}
            >
              <span
                className="plakjanje"
                style={{ fontSize: "14px", color: "#333" }}
              >
                Плаќање во готово или со картичка &nbsp;&nbsp;
                <FaCreditCard
                  style={{
                    fontSize: "20px",
                    verticalAlign: "middle",
                    marginLeft: "5px",
                  }}
                />
              </span>
            </div>
            <div className="col-md-8 col-xs-12" style={{ textAlign: "center" }}>
              <ul
                className="list-unstyled footer-list"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "10px",
                  padding: 0,
                  margin: 0,
                  listStyle: "none",
                }}
              >
                <li>
                  <a
                    className="footer-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="/Content/data/Opsti uslovi na koristenje.pdf"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    Општи услови на користење
                  </a>
                </li>
                <li>
                  <a
                    className="footer-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="/Content/data/Politika na privatnost 2021.pdf"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    Политика на приватност
                  </a>
                </li>
                <li>
                  <a
                    className="footer-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="/Content/data/Politika na kolacinja.pdf"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    Политика на колачиња
                  </a>
                </li>
                <li>
                  <a
                    className="footer-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://docs.google.com/forms/d/e/1FAIpQLSf9B0wLH3apZQIiOKhh642Ipn6A4jYhr2I27YOe8L6Wz8Ocug/viewform"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    Стани доставувач
                  </a>
                </li>
                <li>
                  <a
                    className="footer-link pointer"
                    id="btncontact"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    Контакт
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section
        id="quicklink"
        style={{
          backgroundColor: "#343a40",
          padding: "10px 0",
        }}
      >
        <div className="container">
          <div className="row">
            <div
              className="col-md-12"
              style={{ textAlign: "center", color: "#fff" }}
            >
              <div style={{ fontSize: "14px" }}>
                Copyright © 2025. Порачај и уживај . Сите права се задржани.
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default DownFooter;
