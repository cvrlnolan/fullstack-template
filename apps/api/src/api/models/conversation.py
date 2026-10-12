from uuid import UUID

from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from api.models.base import Base, TimestampedMixin


class Conversation(TimestampedMixin, Base):
    __tablename__ = "conversations"

    title: Mapped[str] = mapped_column(default="")
    messages: Mapped[list["Message"]] = relationship(back_populates="conversation")


class Message(TimestampedMixin, Base):
    __tablename__ = "messages"

    conversation_id: Mapped[UUID] = mapped_column(ForeignKey("conversations.id"))
    role: Mapped[str]
    content: Mapped[str] = mapped_column(Text)
    conversation: Mapped[Conversation] = relationship(back_populates="messages")
