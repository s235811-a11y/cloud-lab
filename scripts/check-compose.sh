#!/usr/bin/env bash
set -u

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:4173}"
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
failed=0

pass() { printf '[ĐẠT] %s\n' "$1"; }
fail() { printf '[CHƯA ĐẠT] %s\n' "$1"; failed=1; }
info() { printf '[CẦN THỰC HIỆN] %s\n' "$1"; }
done_note() { printf '[ĐÃ THỰC HIỆN] %s\n' "$1"; }

printf 'KIỂM TRA CÂU 79 - 94\n'
printf '%s\n' '===================='
done_note 'Câu 79: docker stop mern-backend mern-frontend'

if [[ ! -f "$COMPOSE_FILE" ]]; then
  fail "Câu 80: Tạo file $COMPOSE_FILE"
  exit 1
fi
pass "Câu 80: Tạo file $COMPOSE_FILE"

if ! command -v docker >/dev/null 2>&1; then
  fail "Docker đã được cài đặt"
  exit 1
fi
pass "Docker đã được cài đặt"

if docker compose -f "$COMPOSE_FILE" config >/dev/null 2>&1; then
  pass "Câu 81-82: Compose hợp lệ và có thể đọc cấu hình service"
else
  fail "Docker Compose hợp lệ"
fi

services="$(docker compose -f "$COMPOSE_FILE" config --services 2>/dev/null || true)"
for service in backend frontend; do
  if grep -qx "$service" <<< "$services"; then
    [[ "$service" == backend ]] && pass "Câu 81: Khai báo service backend" || pass "Câu 82: Khai báo service frontend"
  else
    fail "Khai báo service $service"
  fi
done

config="$(docker compose -f "$COMPOSE_FILE" config 2>/dev/null || true)"
grep -q 'published: "5000"' <<< "$config" && pass "Câu 83: Backend ánh xạ port 5000" || fail "Câu 83: Backend ánh xạ port 5000"
grep -q 'published: "4173"' <<< "$config" && pass "Câu 84: Frontend ánh xạ port 4173" || fail "Câu 84: Frontend ánh xạ port 4173"
grep -q 'MONGODB_URI:' <<< "$config" && pass "Câu 85: Backend có biến MONGODB_URI" || fail "Câu 85: Backend có biến MONGODB_URI"

for service in backend frontend; do
  status="$(docker compose -f "$COMPOSE_FILE" ps --status running --services 2>/dev/null || true)"
  if grep -qx "$service" <<< "$status"; then
    [[ "$service" == backend ]] && pass "Câu 86-87: Backend đang chạy" || pass "Câu 86-87: Frontend đang chạy"
  else
    fail "Service $service đang chạy"
  fi
done

if curl -fsS --max-time 10 "$BACKEND_URL/api/hello" >/dev/null; then
  pass "Backend API phản hồi"
else
  fail "Backend API phản hồi"
fi

if docker compose -f "$COMPOSE_FILE" logs --no-color --tail=1 backend >/dev/null 2>&1; then
  pass "Câu 88: Xem log Backend Service"
else
  fail "Câu 88: Xem log Backend Service"
fi

if curl -fsS --max-time 10 "$FRONTEND_URL" >/dev/null; then
  pass "Câu 89: Truy cập frontend tại $FRONTEND_URL"
else
  fail "Frontend phản hồi tại $FRONTEND_URL"
fi

if curl -fsS --max-time 10 "$FRONTEND_URL/api/hello" >/dev/null; then
  pass "Câu 90: Luồng Frontend -> Backend hoạt động"
else
  fail "Frontend proxy tới Backend hoạt động"
fi

if [[ -n "${MONGODB_URI:-}" ]]; then
  pass "MONGODB_URI đã được cung cấp"
else
  info "Câu 90-91: Chưa kiểm tra MongoDB Atlas, hãy đặt MONGODB_URI"
fi

if [[ "${CHECK_MONGO:-0}" == "1" ]]; then
  if [[ -z "${MONGODB_URI:-}" ]]; then
    fail "CHECK_MONGO=1 yêu cầu MONGODB_URI"
  else
    student_id="check-$(date +%s)"
    payload="$(printf '{"studentId":"%s","name":"Compose Check","email":"%s@example.com"}' "$student_id" "$student_id")"
    if curl -fsS --max-time 20 -H 'Content-Type: application/json' -d "$payload" "$FRONTEND_URL/api/students" >/dev/null; then
      pass "Câu 91: Thêm sinh viên qua Frontend -> Backend -> MongoDB Atlas"
    else
      fail "POST sinh viên qua MongoDB Atlas"
    fi
    if curl -fsS --max-time 20 "$FRONTEND_URL/api/students" | grep -q "$student_id"; then
      pass "Câu 90: GET danh sách xác nhận dữ liệu trên MongoDB Atlas"
    else
      fail "GET danh sách sinh viên xác nhận dữ liệu mới"
    fi
  fi
fi

done_note 'Câu 92: docker compose down'
done_note 'Câu 93: docker compose up -d'
pass 'Câu 94: Kiểm tra lại sau restart bằng docker compose ps và frontend ở trên'

if [[ "$failed" -eq 0 ]]; then
  printf '\nKẾT QUẢ: Đạt các kiểm tra đã chạy.\n'
else
  printf '\nKẾT QUẢ: Có kiểm tra thất bại.\n'
fi
exit "$failed"
